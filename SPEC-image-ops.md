# Spec: `image-ops` skill

A Claude Code skill for deterministic image transformations (pad, resize, crop, compose, inspect). Zero AI API calls, zero flakiness, instant results.

---

## Problem statement

Across 8 sessions building this project, deterministic image operations were the second-largest source of friction (after AI image generation itself). Every time a padding, resize, crop, or grid composition was needed, the assistant had to:

1. Decide which tool to use (macOS `sips`, Python PIL/Pillow, Node `sharp`)
2. Write a throwaway script or one-liner in Bash
3. Handle missing dependencies (`ModuleNotFoundError: No module named 'PIL'`, PEP 668 blocking `pip install`)
4. Debug subtle issues (wrong color mode, aspect ratio distortion, off-by-one gaps)

These operations are trivially simple in isolation. The friction was entirely in the boilerplate and environment setup, repeated from scratch every time.

### Quantified impact

From STRUGGLES.md:
- **74 mentions** of sips/PIL/Pillow/sharp across transcripts
- **123 mentions** of padding/resize/crop operations
- **7 Python dependency errors** (PIL not found x2, numpy not found x3, PEP 668 x2)
- **1 strong user frustration signal** ("what are you doing?" when the assistant tried `pip install --break-system-packages`)

---

## Failure cases in detail

### Case 1: D4 onion diagram padding (session `38ff3b4c`)

**Context**: The D4 onion layers diagram (attempt 15) was generated correctly but the concentric circles were too close to the edges. Needed black padding on all sides.

**What happened**:
1. The assistant first tried to use `nano-banana-pro` (AI image generation) to "add black space on all sides." The AI regenerated the entire image instead of just adding padding, producing a different diagram.
2. User frustration: **"D4: nothing happened, do it programmatically: add black space on all sides, keep the aspect ratio"**
3. The assistant then wrote an inline Python script using PIL to add padding. This worked, but required:
   - Figuring out the right PIL imports and API
   - Handling the image mode (RGBA vs RGB)
   - Computing the new canvas size
   - Writing the paste coordinates

**With image-ops**: `uv run image-ops.py pad --input attempt-15.png --output attempt-15-padded.png --px 80 --color black`

### Case 2: D2 progression timeline grid composition (session `38ff3b4c`)

**Context**: The D2 diagram required a 2x2 grid of 4 card images. The AI could not generate a coherent single image, so the approach pivoted to generating 4 individual cards and composing them.

**What happened**:
1. 4 individual card images were generated at different sizes (the AI doesn't produce exact pixel dimensions)
2. Cards needed to be resized to uniform dimensions first
3. Then composed into a 2x2 grid with consistent gaps
4. This cycle repeated **14+ times** (the final file is `d2-composed-v14.png`)
5. Each iteration required writing fresh PIL code for:
   - Reading all 4 images
   - Computing the target cell size (max width, max height across cards)
   - Resizing each card to fit
   - Creating a new canvas with background color
   - Pasting each card at computed coordinates with gap offsets
6. Some iterations had bugs: wrong gap math, cards overlapping, background color mismatch
7. Some PIL runs failed with `ModuleNotFoundError` because the assistant used bare `python3` instead of `uv run --with Pillow`

**With image-ops**: `uv run image-ops.py grid --inputs card1.png card2.png card3.png card4.png --cols 2 --output d2-composed.png --gap 10 --bg "#1A1A1A" --uniform-cells`

### Case 3: S5 illustration fitting into tech-visual panel (session `6ae2db68`)

**Context**: An illustration for section 5 didn't fit well in the website's `.tech-visual` panel. The image needed to be rescaled and centered on a dark canvas.

**What happened**:
1. The assistant **modified the site CSS** to accommodate the image instead of fixing the image itself
2. User frustration: **"this looks like shit, why did you change the html. No reason for that. It's just the image that is ill-fitted."**
3. CSS was reverted
4. The assistant then tried to fix "edge colors" with numpy, which was the wrong diagnosis
5. User frustration: **"it's not about the edge, it's about the image ratio and/or the shapes being too close to the border"**
6. Eventually resolved by writing a PIL script to rescale to 72% and center on a 1920x740 dark canvas
7. But the fix was invisible: **"I don't see a difference on my computer"** (likely a caching issue, but the point is the fix took 4 wrong attempts before landing)

**With image-ops**: `uv run image-ops.py pad-to --input s5.png --width 1920 --height 740 --color "#1A1A1A"` (or `resize` + `pad-to` if the image also needed scaling)

### Case 4: Card size normalization (session `38ff3b4c`)

**Context**: When generating individual cards for D2, each AI generation produced images at slightly different dimensions. Cards needed to be exactly the same size for grid composition.

**What happened**:
1. User: "the 4 cards should be exactly the same size"
2. The assistant used `sips --resampleWidth 800 --resampleHeight 600` on some cards, PIL on others
3. Inconsistent tooling led to inconsistent results (sips uses different resampling than PIL)
4. Some resize commands distorted aspect ratios because `sips --resampleWidth` and `--resampleHeight` together forces exact dimensions without preserving ratio
5. Multiple rounds of resize-then-check-then-resize-again

**With image-ops**: `uv run image-ops.py resize --input card1.png --output card1.png --width 800 --height 600 --fit contain --bg "#1A1A1A"` (resize to fit within bounds, pad remainder with background)

### Case 5: PIL/numpy dependency hell (sessions `e3f438f6`, `6ae2db68`)

**Context**: Every time an inline Python script was needed for image manipulation, dependency issues arose.

**What happened (chronologically)**:
1. `pip3 install pyyaml` blocked by PEP 668
2. Assistant tried `pip3 install --break-system-packages pyyaml` -- user: **"what are you doing?"**
3. Later session: `python3 script.py` -> `ModuleNotFoundError: No module named 'PIL'`
4. Assistant learned to use `uv run --with Pillow python3`
5. But then: `ModuleNotFoundError: No module named 'numpy'` (used in edge color detection)
6. Same numpy error again in a sub-agent context
7. Same numpy error a third time in a different attempt

**With image-ops**: Never happens. The script declares dependencies inline via PEP 723 (`# /// script` / `dependencies = ["pillow>=10.0.0"]`) and runs via `uv run`, which handles the virtual environment automatically.

### Case 6: Background grid overlay (session `6ae2db68`)

**Context**: The user wanted a subtle grid overlay on an illustration background.

**What happened**:
1. The assistant tried to use the AI image API to "add a subtle grid pattern"
2. The AI reinterpreted the entire image instead of just adding a grid
3. Multiple attempts with different prompts, none producing a clean grid
4. Eventually wrote PIL code to draw grid lines at precise opacity

**With image-ops**: This one is borderline. A `grid-overlay` command could exist but it's specialized. More likely this stays as a one-off PIL script. However, image-ops providing an `info` command would at least tell the assistant the exact dimensions before writing the overlay code.

---

## Proposed skill structure

```
.claude/skills/image-ops/
  SKILL.md          # Skill instructions for Claude
  scripts/
    image_ops.py    # Single script with subcommands
```

### Dependencies (inline PEP 723)

```python
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pillow>=10.0.0",
# ]
# ///
```

No numpy. No sharp. No system packages. Just Pillow, managed by `uv`.

---

## Commands

### `info`

Print image dimensions, format, and color mode.

```bash
uv run image_ops.py info --input img.png
```

Output:
```
file: img.png
size: 1920x1080
format: PNG
mode: RGBA
```

Useful before any transformation to understand what you're working with. Would have prevented several "wrong diagnosis" situations (e.g., the edge color issue where the assistant didn't check dimensions first).

### `pad`

Add uniform padding on all sides.

```bash
uv run image_ops.py pad --input img.png --output padded.png --px 50 --color "#1A1A1A"
```

Parameters:
- `--px`: Padding in pixels (uniform all sides)
- `--px-h` / `--px-v`: Horizontal / vertical padding (override `--px` for asymmetric)
- `--color`: Background color (hex string or named color). Default: `black`
- `--output`: Output path (defaults to overwriting input if omitted? or require it?)

### `pad-to`

Pad to reach a target canvas size, centering the image.

```bash
uv run image_ops.py pad-to --input img.png --output padded.png --width 1920 --height 1080 --color black
```

If the image is larger than the target in one dimension, that dimension is not cropped (error? or scale down first?). Proposed behavior: error with a message suggesting `resize` first.

### `resize`

Resize an image. Preserves aspect ratio by default.

```bash
# Resize to width, auto-compute height
uv run image_ops.py resize --input img.png --output resized.png --width 800

# Resize to height, auto-compute width
uv run image_ops.py resize --input img.png --output resized.png --height 600

# Resize to exact dimensions (may distort)
uv run image_ops.py resize --input img.png --output resized.png --width 800 --height 600 --mode stretch

# Resize to fit within bounds, preserving ratio (default when both given)
uv run image_ops.py resize --input img.png --output resized.png --width 800 --height 600 --mode contain

# Resize to fit within bounds, pad remainder
uv run image_ops.py resize --input img.png --output resized.png --width 800 --height 600 --mode contain --bg "#1A1A1A"

# Resize to cover bounds, crop overflow
uv run image_ops.py resize --input img.png --output resized.png --width 800 --height 600 --mode cover
```

Resampling: `LANCZOS` for downscaling, `LANCZOS` for upscaling. No configuration needed.

### `crop`

Remove pixels from edges.

```bash
# Crop 50px from each side
uv run image_ops.py crop --input img.png --output cropped.png --px 50

# Crop specific sides
uv run image_ops.py crop --input img.png --output cropped.png --left 50 --top 100 --right 50 --bottom 100

# Crop to a box (left, top, right, bottom coordinates)
uv run image_ops.py crop --input img.png --output cropped.png --box 100,100,900,700
```

### `grid`

Compose multiple images into a grid layout.

```bash
uv run image_ops.py grid \
  --inputs card1.png card2.png card3.png card4.png \
  --cols 2 \
  --output grid.png \
  --gap 10 \
  --bg "#1A1A1A"
```

Parameters:
- `--inputs`: List of image paths (row-major order: top-left, top-right, bottom-left, bottom-right for a 2x2)
- `--cols`: Number of columns. Rows computed automatically.
- `--gap`: Gap between cells in pixels. Default: 0
- `--bg`: Background/gap color. Default: `black`
- `--uniform-cells`: If set, resize all images to match the largest cell dimensions (preserving ratio, padding with `--bg`). Without this flag, images are placed at their original sizes and cells match the largest image in each row/column.

This is the command that would have saved the most time. D2 went through 14+ composition iterations, each requiring fresh PIL code.

### `hstack` / `vstack`

Simpler variants of `grid` for linear layouts.

```bash
# Horizontal stack
uv run image_ops.py hstack --inputs a.png b.png c.png --output row.png --gap 10 --bg black --align middle

# Vertical stack
uv run image_ops.py vstack --inputs a.png b.png c.png --output col.png --gap 10 --bg black --align center
```

Parameters:
- `--align`: For hstack: `top`, `middle`, `bottom`. For vstack: `left`, `center`, `right`. Default: `middle`/`center`.

---

## SKILL.md content

The skill instructions should make clear:
1. **When to use image-ops vs nano-banana-pro**: image-ops for any transformation where the desired output is fully specified by parameters (dimensions, colors, positions). nano-banana-pro for anything requiring AI interpretation (style changes, content generation, element addition/removal).
2. **Always use image-ops for**: padding, resizing, cropping, grid composition, dimension checking.
3. **Never use nano-banana-pro for**: padding, resizing, cropping, grid composition. The AI will reinterpret the image instead of performing the mechanical operation.
4. **Run from project directory**: Same as nano-banana-pro, run from the user's working directory so paths resolve correctly.

---

## Design decisions to make during implementation

1. **Overwrite behavior**: Should `--output` be required, or should omitting it overwrite the input? Requiring it is safer (no accidental data loss). But adds verbosity. Proposal: require `--output`, but support `--output same` as explicit opt-in to overwrite.

2. **Error on upscale**: Should `resize` warn when upscaling (quality loss)? Probably not worth the complexity. Just do it.

3. **Color parsing**: Support hex (`#1A1A1A`, `#fff`), named colors (`black`, `white`, `red`), and RGB tuples (`rgb(26,26,26)`)? Proposal: hex and named colors only. Pillow's `ImageColor.getrgb()` handles both.

4. **Output format**: Always PNG? Or infer from extension? Proposal: infer from output extension, default to PNG if ambiguous.

5. **Alpha handling**: Preserve alpha if input has it, or always flatten to RGB? Proposal: preserve alpha by default, add `--flatten` flag to composite onto background color.

---

## Relationship to nano-banana-pro

These two skills are complementary:
- `nano-banana-pro`: AI generates or edits image content
- `image-ops`: Mechanical transforms on existing images

A typical workflow for a complex diagram like D2 would be:
1. `nano-banana-pro` to generate 4 individual cards (AI content generation)
2. `image-ops resize` to normalize card dimensions (mechanical)
3. `image-ops grid` to compose into a 2x2 layout (mechanical)
4. `image-ops pad` to add margin if needed (mechanical)

Steps 2-4 would have been one command each instead of writing fresh PIL code 14 times.
