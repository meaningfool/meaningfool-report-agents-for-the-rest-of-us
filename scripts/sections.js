// Section layout and structure.
// Editorial content (titles, summaries, metadata) lives in content.yaml.

export const sections = [
  {
    num: 1,
    slug: 'agent-framework-landscape',
    startMarker: null,
    endMarker: '# Part 1',
    svg: '<path class="path-line" d="M10,50 L30,45 L30,20 L60,20 L60,40 L90,30"></path>',
    image: 'images/card-agent-framework-landscape.webp',
  },
  {
    num: 2,
    slug: 'what-is-an-llm-agent',
    startMarker: '# Part 1',
    endMarker: '# Part 2',
    svg: '<path class="path-line" d="M10,30 L40,30 L40,10 L70,10 L70,50 L90,50"></path>',
    image: 'images/card-what-is-an-llm-agent.webp',
  },
  {
    num: 3,
    slug: 'agent-orchestration',
    startMarker: '# Part 2',
    endMarker: '# Part 3',
    svg: '<path class="path-line" d="M10,10 Q30,50 50,30 T90,30"></path>',
    image: 'images/card-agent-orchestration.webp',
  },
  {
    num: 4,
    slug: 'agent-tools-and-primitives',
    startMarker: '# Part 3',
    endMarker: '# Part 4',
    svg: '<path class="path-line" d="M10,50 C30,50 30,10 50,10 S70,50 90,50"></path>',
    image: 'images/card-agent-tools-and-primitives.webp',
  },
  {
    num: 5,
    slug: 'agent-sdk-vs-agent-server',
    startMarker: '# Part 4',
    endMarker: '# Part 5',
    svg: `<path class="path-line" d="M20,10 L20,50 M50,10 L50,50 M80,10 L80,50" style="stroke-dasharray: 4,4"></path>
                    <path class="path-line" d="M10,30 L90,30"></path>`,
    image: 'images/card-agent-sdk-vs-agent-server.webp',
  },
  {
    num: 6,
    slug: 'agent-architecture-examples',
    startMarker: '# Part 5',
    endMarker: '## Going further',
    svg: `<path class="path-line" d="M50,30 L20,50 M50,30 L80,50 M50,30 L50,10"></path>
                    <circle cx="50" cy="30" r="3" fill="#DFFF4F"></circle>`,
    image: 'images/card-agent-architecture-examples.webp',
  },
  {
    num: 7,
    slug: 'agent-sdk-resources',
    startMarker: '## Going further',
    endMarker: null,
    svg: '<path class="path-line" d="M10,40 L30,40 L35,20 L65,20 L70,40 L90,40"></path>',
    image: 'images/card-agent-sdk-resources.webp',
  },
];
