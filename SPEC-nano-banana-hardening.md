# Spec: Harden `nano-banana-pro` skill

Improvements to the existing nano-banana-pro skill to eliminate recurring setup failures, API error handling friction, and misuse patterns.

---

## Problem statement

The nano-banana-pro skill works once it's running, but getting there and staying there costs significant time and tokens. Across sessions:

- **5 consecutive setup failures** before the first image was ever generated
- **15+ Gemini API 500/503 errors** requiring manual retry-with-sleep chains
- **80 background task failures** in a single session from wrong script paths and missing error context
- **62,000 tokens wasted** on sub-agents that couldn't use the skill (no Bash access)
- **Edit mode failures** more frequent than generation mode, with no guidance to switch approaches

---

## Failure cases in detail

### Case 1: First-time setup (session `6ede3104`)

Five errors in sequence before a single image was produced:

1. **`uv` not on PATH** (exit code 127): The `uv` package manager wasn't installed or wasn't on PATH. The assistant searched `~/.cargo/bin`, `~/.local/bin`, ran `source ~/.zshrc && which uv`, even ran a background `find` across the entire home directory. Eventually installed `uv` from scratch via `curl -LsSf https://astral.sh/uv/install.sh | sh`.

2. **Wrong script path**: The SKILL.md says `~/.claude/skills/nano-banana-pro/scripts/generate_image.py` but the skill lives at the project level `.claude/skills/nano-banana-pro/scripts/generate_image.py`. The assistant tried the home-level path 3 times before finding the right one via Glob.

3. **Missing API key**: No `GEMINI_API_KEY` environment variable set. The assistant tried to search environment variables, but the user rejected the tool use (privacy concern). Resolved by creating a `.env` file.

4. **API key not exported**: Even after `.env` existed, `GEMINI_API_KEY` wasn't picked up because the script only checks `os.environ`, and `.env` files aren't automatically sourced in shell sessions. Fixed by chaining: `export PATH="$HOME/.local/bin:$PATH" && export $(grep GEMINI_API_KEY .env) && uv run ...`

5. The assistant eventually settled on this incantation, which had to be repeated for every single image generation call throughout the session.

### Case 2: API 500/503 cascade (session `6ede3104`)

The Gemini API returned HTTP 500 "Internal error encountered" at least 15 times throughout the session. The assistant developed an escalating manual retry pattern:

```bash
sleep 5 && uv run ... --prompt "..."   # first retry
sleep 10 && uv run ... --prompt "..."  # second retry
sleep 15 && uv run ... --prompt "..."  # third retry
sleep 30 && uv run ... --prompt "..."  # desperation retry
```

This pattern was reinvented from scratch in every session. No learning carried over.

One 503 error included the message "This model is currently experiencing high demand." The assistant had no way to distinguish between "retry in 5s" and "come back in 5 minutes."

**Edit mode was especially unreliable**: The assistant eventually acknowledged: "The edit mode keeps failing on this image (likely the resolution)." But there was no guidance in the skill to switch from edit mode to fresh generation after repeated edit failures.

### Case 3: 80 background task failures (session `38ff3b4c`)

When the assistant tried to generate all diagram variations in parallel using background Bash commands:

- **Phase 1 (~30 failures, exit code 2)**: Wrong script path. The assistant used a path that didn't resolve in the background shell context. All D1-D4 attempts 1-3 failed silently with exit code 2.
- **Phase 2 (~50 failures, exit code 1)**: After "fixing" the path, continued failing. The error output from background tasks wasn't visible, so the assistant couldn't diagnose whether it was a path issue, API key issue, or API error.
- **36 failure notifications arrived in 3 seconds**: Between lines 382-452 of the transcript, failure notifications flooded the conversation at ~1 per second, each saying `Background command "Generate DX attempt Y" failed with exit code Z` with no further detail.

The root cause was likely a combination of wrong path + missing API key in the background shell environment. But the error messages gave no indication of which.

### Case 4: Sub-agents can't use the skill (session `38ff3b4c`)

4 Task sub-agents were spawned in parallel to generate diagram variations. Each sub-agent:
1. Received a detailed prompt with image description
2. Composed the `uv run ...` command
3. Tried to call Bash
4. Got "permission denied"
5. Returned a message asking for Bash access

| Sub-agent | Tokens wasted | Duration |
|-----------|---------------|----------|
| D1 framework map | 19,879 | 50s |
| D2 timeline | 13,649 | 26s |
| D3 workflow | 14,748 | 27s |
| D4 onion layers | 13,649 | 16s |
| **Total** | **62,000+** | **~2min** |

The skill instructions say nothing about this limitation.

### Case 5: Edit mode producing unexpected results

Multiple instances where `--input-image` editing mode produced surprising outputs:

1. **D4 padding attempt**: Asked to "add black padding on all sides." The AI regenerated the entire diagram with a different layout instead of just adding padding.
2. **Background noise**: When editing a photo of a hand-drawn sketch, the AI "captured the fact that I took a picture of hand-drawn note and that transparency there was some other stuff showing behind" (the desk surface bled through).
3. **Style drift**: Editing an existing image to change colors sometimes changed the entire style, losing the hand-drawn aesthetic.

The skill instructions treat edit mode as reliable and equivalent to generation mode. In practice, edit mode is significantly less predictable.

---

## Proposed changes

### Change 1: Retry with exponential backoff

Add retry logic inside `generate_image.py` so the assistant never needs to write manual sleep chains.

**Current behavior**: On any error, print message and `sys.exit(1)`.

**Proposed behavior**:

```python
import time

MAX_RETRIES = 3
BACKOFF_DELAYS = [5, 15, 30]

def is_retryable(error: Exception) -> bool:
    """Check if an API error is transient and worth retrying."""
    error_str = str(error).lower()
    retryable_signals = [
        "500", "503",
        "internal",
        "high demand",
        "resource_exhausted",
        "overloaded",
        "temporarily unavailable",
    ]
    return any(signal in error_str for signal in retryable_signals)

# In main(), replace the single try/except with:
last_error = None
for attempt in range(MAX_RETRIES + 1):
    try:
        response = client.models.generate_content(...)
        break
    except Exception as e:
        last_error = e
        if is_retryable(e) and attempt < MAX_RETRIES:
            delay = BACKOFF_DELAYS[attempt]
            print(f"[Retry {attempt + 1}/{MAX_RETRIES}] Transient error: {e}")
            print(f"  Waiting {delay}s before retry...")
            time.sleep(delay)
        else:
            break
else:
    print(f"ERROR: All {MAX_RETRIES} retries exhausted. Last error: {last_error}", file=sys.stderr)
    sys.exit(1)
```

**Impact**: Eliminates ~15 manual retry cycles across sessions. The assistant can fire-and-forget image generation commands.

### Change 2: Auto-source API key from `.env`

Add `.env` file discovery as a fallback in `get_api_key()`.

**Current behavior**: Check `--api-key` arg, then `GEMINI_API_KEY` env var, then fail.

**Proposed behavior**:

```python
def get_api_key(provided_key: str | None) -> str | None:
    """Get API key from argument, environment, or .env file."""
    if provided_key:
        return provided_key

    env_key = os.environ.get("GEMINI_API_KEY")
    if env_key:
        return env_key

    # Walk up from cwd looking for .env with GEMINI_API_KEY
    cwd = Path.cwd()
    for directory in [cwd, *cwd.parents]:
        env_file = directory / ".env"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                line = line.strip()
                if line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                if key.strip() == "GEMINI_API_KEY":
                    return value.strip().strip('"').strip("'")
        # Stop at filesystem root or home directory
        if directory == Path.home() or directory == directory.parent:
            break

    return None
```

**Impact**: Eliminates the `export $(grep GEMINI_API_KEY .env) &&` prefix that had to be prepended to every command. Works automatically once a `.env` file exists anywhere in the project tree.

### Change 3: Structured error messages with fix suggestions

Replace generic error output with actionable messages.

**Current behavior**: `Error generating image: <raw exception>` + exit code 1 for everything.

**Proposed behavior**:

```python
except Exception as e:
    error_str = str(e)
    print(f"\nERROR: {e}", file=sys.stderr)
    print("---", file=sys.stderr)

    if "API_KEY" in error_str or "PERMISSION_DENIED" in error_str or "api key" in error_str.lower():
        print("DIAGNOSIS: API key missing or invalid.", file=sys.stderr)
        print("FIX: Create a .env file with GEMINI_API_KEY=your-key-here", file=sys.stderr)
        print("     Or pass --api-key directly.", file=sys.stderr)
        sys.exit(2)

    elif "404" in error_str or "not found" in error_str.lower():
        print("DIAGNOSIS: Model not found. The model ID may have changed.", file=sys.stderr)
        print(f"FIX: Check if 'gemini-3-pro-image-preview' is still the correct model name.", file=sys.stderr)
        sys.exit(3)

    elif is_retryable(e):
        # Only reached if all retries exhausted
        print("DIAGNOSIS: Gemini API is overloaded or experiencing errors.", file=sys.stderr)
        print("FIX: Wait a few minutes and try again. Consider reducing resolution.", file=sys.stderr)
        sys.exit(4)

    elif "image" in error_str.lower() and ("large" in error_str.lower() or "size" in error_str.lower()):
        print("DIAGNOSIS: Input image may be too large for the API.", file=sys.stderr)
        print("FIX: Resize the input image before editing. Try --resolution 1K.", file=sys.stderr)
        sys.exit(5)

    else:
        print("DIAGNOSIS: Unknown error.", file=sys.stderr)
        print(f"FIX: Check the full error above. Common causes:", file=sys.stderr)
        print(f"  - Invalid prompt (safety filter)", file=sys.stderr)
        print(f"  - Network connectivity", file=sys.stderr)
        print(f"  - API quota exceeded", file=sys.stderr)
        sys.exit(1)
```

**Exit codes**:
| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Unknown error |
| 2 | API key issue |
| 3 | Model not found |
| 4 | API overloaded (retries exhausted) |
| 5 | Input image issue |

**Impact**: When 80 background tasks fail, the exit code alone tells the assistant whether it's a key issue (fix once), a path issue (fix once), or an API issue (wait and retry). Currently all failures return exit code 1, giving no diagnostic signal.

### Change 4: Script path resilience

The SKILL.md currently hardcodes `~/.claude/skills/nano-banana-pro/scripts/generate_image.py` but the skill can live in the project directory. The assistant has to guess which path is correct.

**Proposed change to SKILL.md**:

Replace the hardcoded path with a resolution strategy:

```markdown
## Usage

The script path depends on where the skill is installed. Use this resolution order:
1. Project-local: `.claude/skills/nano-banana-pro/scripts/generate_image.py`
2. User-level: `~/.claude/skills/nano-banana-pro/scripts/generate_image.py`

Before first use in a session, verify the path exists. Example:
```bash
ls .claude/skills/nano-banana-pro/scripts/generate_image.py 2>/dev/null || ls ~/.claude/skills/nano-banana-pro/scripts/generate_image.py
```
```

Alternatively, the script could be made available as a `uv tool` that resolves automatically, but that's a larger change.

### Change 5: SKILL.md additions

Add three new sections to the skill instructions:

```markdown
## Limitations

- **Cannot be used from Task sub-agents**: Sub-agents do not have Bash access.
  Always run image generation from the main agent context. Never delegate
  image generation to a Task sub-agent.

- **Edit mode is less reliable than generation mode**: The `--input-image` editing
  mode fails more often (API 500s) and produces less predictable results than fresh
  generation. If editing fails twice on the same image, switch to generation mode:
  describe the full desired output in the prompt without providing an input image.

- **Not for mechanical transforms**: Never use this skill for padding, resizing,
  cropping, or grid composition. These deterministic operations should use the
  `image-ops` skill (or direct PIL/sips commands). The AI will reinterpret the
  image content instead of performing the mechanical operation.

## Retry behavior

The script automatically retries on transient API errors (500, 503, rate limits)
up to 3 times with exponential backoff (5s, 15s, 30s). You do not need to add
manual `sleep` delays before retries.

If the script exits with code 4 (API overloaded), wait 2-3 minutes before
trying again.

## API key

The script automatically discovers the API key from:
1. `--api-key` argument
2. `GEMINI_API_KEY` environment variable
3. `.env` file in the current directory or any parent directory

You do not need to manually `export` the key from `.env`.

## Exit codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Success | None |
| 1 | Unknown error | Check error message |
| 2 | API key missing/invalid | Add key to .env |
| 3 | Model not found | Check model name |
| 4 | API overloaded, retries exhausted | Wait 2-3 minutes |
| 5 | Input image issue | Resize input or drop --input-image |

## Iteration guidance

When iterating on image generation with user feedback:
- After 3 failed attempts at a complex composition, consider decomposing into
  individual elements and composing with `image-ops grid`.
- After 5 attempts on the same concept, pause and ask the user to validate
  the approach before continuing.
- Keep track of which attempt number you're on and communicate it clearly
  (e.g., "Generating attempt 6 for D2...").
```

---

## Summary of all changes

| # | Change | File | Effort |
|---|--------|------|--------|
| 1 | Retry with exponential backoff | `generate_image.py` | Small |
| 2 | Auto-source API key from `.env` | `generate_image.py` | Small |
| 3 | Structured error messages + exit codes | `generate_image.py` | Small |
| 4 | Script path resolution guidance | `SKILL.md` | Trivial |
| 5 | Limitations, retry docs, iteration guidance | `SKILL.md` | Trivial |

All changes are backward-compatible. No new dependencies. No API changes. The script gains resilience without changing its interface.
