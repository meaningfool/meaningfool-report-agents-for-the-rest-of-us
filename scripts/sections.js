// Single source of truth for all section metadata.
// Used by generate.js to build both the home page and section pages.

export const sections = [
  {
    num: 1,
    title: 'Mapping the Terrain',
    summary: 'A PM\u2019s mental map for navigating the agent framework landscape. The 2\u00d72 taxonomy that structures this report.',
    startMarker: null,
    endMarker: '# Part 1',
    svg: '<path class="path-line" d="M10,50 L30,45 L30,20 L60,20 L60,40 L90,30"></path>',
    image: 'images/2026-02-11-s1-topo-map-v4-zoom1.5x.png',
  },
  {
    num: 2,
    title: "What's an Agent, Anyway?",
    summary: 'An LLM running tools in a loop. Unpacking the three primitives: models, tools, and the agentic loop.',
    startMarker: '# Part 1',
    endMarker: '# Part 2',
    svg: '<path class="path-line" d="M10,30 L40,30 L40,10 L70,10 L70,50 L90,50"></path>',
    image: 'images/2026-02-11-s2-loop-chain-v2.png',
  },
  {
    num: 3,
    title: 'Where Orchestration Lives',
    summary: 'App-driven vs. agent-driven control flow. The spectrum from developer-defined workflows to model-determined execution.',
    startMarker: '# Part 2',
    endMarker: '# Part 3',
    svg: '<path class="path-line" d="M10,10 Q30,50 50,30 T90,30"></path>',
    image: 'images/2026-02-12-orch-full-b-fitted.png',
  },
  {
    num: 4,
    title: 'Two Tools to Rule Them All',
    summary: 'Why Bash and the filesystem replace specialized tools. The case for universal primitives over predefined capabilities.',
    startMarker: '# Part 3',
    endMarker: '# Part 4',
    svg: '<path class="path-line" d="M10,50 C30,50 30,10 50,10 S70,50 90,50"></path>',
    image: 'images/s4-attempt-5-fitted.png',
  },
  {
    num: 5,
    title: 'Agent SDK to Agent Server',
    summary: 'From embedded library to networked service. The six layers you build when crossing the service boundary.',
    startMarker: '# Part 4',
    endMarker: '# Part 5',
    svg: `<path class="path-line" d="M20,10 L20,50 M50,10 L50,50 M80,10 L80,50" style="stroke-dasharray: 4,4"></path>
                    <path class="path-line" d="M10,30 L90,30"></path>`,
    image: 'images/s5-composed-fitted.png',
  },
  {
    num: 6,
    title: 'Architecture by Example',
    summary: 'Four real-world projects showing different choices: job agents, transport adapters, full stacks, and personal platforms.',
    startMarker: '# Part 5',
    endMarker: '## Going further',
    svg: `<path class="path-line" d="M50,30 L20,50 M50,30 L80,50 M50,30 L50,10"></path>
                    <circle cx="50" cy="30" r="3" fill="#DFFF4F"></circle>`,
    image: 'images/s6-attempt-5-edit-h-fitted.png',
  },
  {
    num: 7,
    title: 'Further Reading',
    summary: 'Curated references across foundational concepts, runtime infrastructure, and implementation patterns.',
    startMarker: '## Going further',
    endMarker: null,
    svg: '<path class="path-line" d="M10,40 L30,40 L35,20 L65,20 L70,40 L90,40"></path>',
    image: 'images/s7-attempt-5-edit-b.png',
  },
];
