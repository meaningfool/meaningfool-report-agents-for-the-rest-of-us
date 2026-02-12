// Section layout and structure.
// Editorial content (titles, summaries, metadata) lives in content.yaml.

export const sections = [
  {
    num: 1,
    startMarker: null,
    endMarker: '# Part 1',
    svg: '<path class="path-line" d="M10,50 L30,45 L30,20 L60,20 L60,40 L90,30"></path>',
    image: 'images/2026-02-11-s1-topo-map-v4-zoom1.5x.png',
  },
  {
    num: 2,
    startMarker: '# Part 1',
    endMarker: '# Part 2',
    svg: '<path class="path-line" d="M10,30 L40,30 L40,10 L70,10 L70,50 L90,50"></path>',
    image: 'images/2026-02-11-s2-loop-chain-v2.png',
  },
  {
    num: 3,
    startMarker: '# Part 2',
    endMarker: '# Part 3',
    svg: '<path class="path-line" d="M10,10 Q30,50 50,30 T90,30"></path>',
    image: 'images/2026-02-12-orch-full-b-fitted.png',
  },
  {
    num: 4,
    startMarker: '# Part 3',
    endMarker: '# Part 4',
    svg: '<path class="path-line" d="M10,50 C30,50 30,10 50,10 S70,50 90,50"></path>',
    image: 'images/s4-attempt-5-fitted.png',
  },
  {
    num: 5,
    startMarker: '# Part 4',
    endMarker: '# Part 5',
    svg: `<path class="path-line" d="M20,10 L20,50 M50,10 L50,50 M80,10 L80,50" style="stroke-dasharray: 4,4"></path>
                    <path class="path-line" d="M10,30 L90,30"></path>`,
    image: 'images/s5-composed-fitted.png',
  },
  {
    num: 6,
    startMarker: '# Part 5',
    endMarker: '## Going further',
    svg: `<path class="path-line" d="M50,30 L20,50 M50,30 L80,50 M50,30 L50,10"></path>
                    <circle cx="50" cy="30" r="3" fill="#DFFF4F"></circle>`,
    image: 'images/s6-attempt-5-edit-h-fitted.png',
  },
  {
    num: 7,
    startMarker: '## Going further',
    endMarker: null,
    svg: '<path class="path-line" d="M10,40 L30,40 L35,20 L65,20 L70,40 L90,40"></path>',
    image: 'images/s7-attempt-5-edit-b.png',
  },
];
