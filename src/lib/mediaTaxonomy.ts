// Comprehensive Art Media Taxonomy
// Centralized source for all art mediums, materials, and techniques
// Used across the application for consistent categorization and search

export interface MediaCategory {
  id: string
  name: string
  description: string
  keywords: string[]
  parent?: string
  children?: string[]
}

export interface ColorCategory {
  id: string
  name: string
  hex?: string
  rgb?: [number, number, number]
  hsl?: [number, number, number]
  category: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'quality' | 'pigment' | 'temperature'
  keywords: string[]
}

export interface SubjectCategory {
  id: string
  name: string
  description: string
  keywords: string[]
  parent?: string
  children?: string[]
}

export interface GenreCategory {
  id: string
  name: string
  description: string
  keywords: string[]
  period?: string
  parent?: string
  children?: string[]
}

// Comprehensive Media Taxonomy
export const MEDIA_TAXONOMY: MediaCategory[] = [
  {
    id: 'painting',
    name: 'Painting',
    description: 'Traditional and contemporary painting mediums',
    keywords: ['painting', 'paint', 'painted'],
    children: ['oil-painting', 'acrylic-painting', 'watercolor-painting', 'mixed-media-painting']
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    description: 'Oil-based painting mediums',
    keywords: [
      'oil', 'oil painting', 'oil on canvas', 'oil on panel', 'oil on board',
      'oil on linen', 'oil on paper', 'oil on wood', 'oil on masonite',
      'oil on aluminum', 'oil on copper', 'oil on silk', 'oil on vellum'
    ],
    parent: 'painting'
  },
  {
    id: 'acrylic-painting',
    name: 'Acrylic Painting',
    description: 'Acrylic-based painting mediums',
    keywords: [
      'acrylic', 'acrylic painting', 'acrylic on canvas', 'acrylic on paper',
      'acrylic on board', 'acrylic on wood', 'acrylic on panel', 'acrylic on linen'
    ],
    parent: 'painting'
  },
  {
    id: 'watercolor-painting',
    name: 'Watercolor Painting',
    description: 'Water-based painting mediums',
    keywords: [
      'watercolor', 'watercolour', 'gouache', 'tempera', 'fresco',
      'encaustic', 'casein', 'egg tempera', 'distemper', 'aquarelle'
    ],
    parent: 'painting'
  },
  {
    id: 'drawing',
    name: 'Drawing',
    description: 'Drawing and sketching mediums',
    keywords: ['drawing', 'draw', 'drawn', 'sketch', 'sketching'],
    children: ['pencil-drawing', 'charcoal-drawing', 'ink-drawing', 'pastel-drawing']
  },
  {
    id: 'pencil-drawing',
    name: 'Pencil Drawing',
    description: 'Pencil and graphite-based drawing',
    keywords: [
      'pencil', 'graphite', 'colored pencil', 'mechanical pencil', 'lead pencil',
      'charcoal pencil', 'conte crayon', 'carbon pencil', 'grease pencil'
    ],
    parent: 'drawing'
  },
  {
    id: 'charcoal-drawing',
    name: 'Charcoal Drawing',
    description: 'Charcoal-based drawing',
    keywords: [
      'charcoal', 'vine charcoal', 'compressed charcoal', 'charcoal stick',
      'charcoal powder', 'willow charcoal', 'carbon', 'soot'
    ],
    parent: 'drawing'
  },
  {
    id: 'ink-drawing',
    name: 'Ink Drawing',
    description: 'Ink-based drawing and illustration',
    keywords: [
      'ink', 'pen and ink', 'brush and ink', 'india ink', 'sumi ink',
      'calligraphy', 'marker', 'felt tip', 'ballpoint', 'fountain pen',
      'dip pen', 'quill', 'brush pen', 'technical pen'
    ],
    parent: 'drawing'
  },
  {
    id: 'pastel-drawing',
    name: 'Pastel Drawing',
    description: 'Pastel-based drawing and painting',
    keywords: [
      'pastel', 'soft pastel', 'oil pastel', 'chalk pastel', 'hard pastel',
      'pastel pencil', 'crayon', 'chalk', 'conte', 'sanguine'
    ],
    parent: 'drawing'
  },
  {
    id: 'printmaking',
    name: 'Printmaking',
    description: 'Various printmaking techniques',
    keywords: ['print', 'printmaking', 'edition', 'impression'],
    children: ['relief-printing', 'intaglio-printing', 'planographic-printing', 'stencil-printing']
  },
  {
    id: 'relief-printing',
    name: 'Relief Printing',
    description: 'Relief-based printmaking',
    keywords: [
      'woodcut', 'linocut', 'relief print', 'woodblock', 'linoleum block',
      'rubber stamp', 'letterpress', 'type', 'movable type'
    ],
    parent: 'printmaking'
  },
  {
    id: 'intaglio-printing',
    name: 'Intaglio Printing',
    description: 'Intaglio-based printmaking',
    keywords: [
      'etching', 'engraving', 'drypoint', 'aquatint', 'mezzotint',
      'intaglio', 'copperplate', 'steel plate', 'zinc plate'
    ],
    parent: 'printmaking'
  },
  {
    id: 'planographic-printing',
    name: 'Planographic Printing',
    description: 'Planographic printmaking techniques',
    keywords: [
      'lithograph', 'lithography', 'stone lithography', 'aluminum plate',
      'zinc plate', 'monotype', 'collagraph', 'chine collé'
    ],
    parent: 'printmaking'
  },
  {
    id: 'stencil-printing',
    name: 'Stencil Printing',
    description: 'Stencil-based printmaking',
    keywords: [
      'serigraph', 'screen print', 'silkscreen', 'stencil', 'pochoir',
      'spray paint', 'airbrush', 'template', 'cut paper'
    ],
    parent: 'printmaking'
  },
  {
    id: 'photography',
    name: 'Photography',
    description: 'Photographic mediums and processes',
    keywords: ['photography', 'photograph', 'photo', 'image'],
    children: ['analog-photography', 'digital-photography', 'alternative-photography']
  },
  {
    id: 'analog-photography',
    name: 'Analog Photography',
    description: 'Traditional film-based photography',
    keywords: [
      'film', 'analog', 'black and white', 'color film', 'slide film',
      'negative', 'positive', 'gelatin silver', 'c-print', 'chromogenic',
      'polaroid', 'instant', 'daguerreotype', 'ambrotype', 'tintype'
    ],
    parent: 'photography'
  },
  {
    id: 'digital-photography',
    name: 'Digital Photography',
    description: 'Digital photography and printing',
    keywords: [
      'digital', 'digital photo', 'inkjet', 'giclée', 'archival print',
      'pigment print', 'dye sublimation', 'laser print', 'thermal print'
    ],
    parent: 'photography'
  },
  {
    id: 'alternative-photography',
    name: 'Alternative Photography',
    description: 'Alternative and experimental photographic processes',
    keywords: [
      'cyanotype', 'van dyke', 'salt print', 'albumen', 'platinum',
      'palladium', 'gum bichromate', 'carbon', 'carbro', 'fresson',
      'lumen', 'chemigram', 'photogram', 'rayograph'
    ],
    parent: 'photography'
  },
  {
    id: 'sculpture',
    name: 'Sculpture',
    description: 'Three-dimensional art forms',
    keywords: ['sculpture', 'sculpt', 'sculpted', 'three-dimensional', '3d'],
    children: ['stone-sculpture', 'metal-sculpture', 'wood-sculpture', 'ceramic-sculpture']
  },
  {
    id: 'stone-sculpture',
    name: 'Stone Sculpture',
    description: 'Stone-based sculpture',
    keywords: [
      'marble', 'granite', 'limestone', 'sandstone', 'alabaster',
      'soapstone', 'jade', 'onyx', 'travertine', 'basalt', 'slate'
    ],
    parent: 'sculpture'
  },
  {
    id: 'metal-sculpture',
    name: 'Metal Sculpture',
    description: 'Metal-based sculpture',
    keywords: [
      'bronze', 'steel', 'aluminum', 'iron', 'copper', 'brass',
      'stainless steel', 'cast iron', 'welded', 'forged', 'hammered'
    ],
    parent: 'sculpture'
  },
  {
    id: 'wood-sculpture',
    name: 'Wood Sculpture',
    description: 'Wood-based sculpture',
    keywords: [
      'wood', 'wood carving', 'wooden', 'oak', 'pine', 'mahogany',
      'walnut', 'cherry', 'maple', 'birch', 'cedar', 'teak'
    ],
    parent: 'sculpture'
  },
  {
    id: 'ceramic-sculpture',
    name: 'Ceramic Sculpture',
    description: 'Ceramic and clay-based sculpture',
    keywords: [
      'ceramic', 'pottery', 'clay', 'terracotta', 'porcelain', 'earthenware',
      'stoneware', 'raku', 'glazed', 'unglazed', 'fired', 'kiln'
    ],
    parent: 'sculpture'
  },
  {
    id: 'glass-art',
    name: 'Glass Art',
    description: 'Glass-based art forms',
    keywords: [
      'glass', 'blown glass', 'stained glass', 'crystal', 'fused glass',
      'slumped glass', 'cast glass', 'kiln-formed', 'hot glass', 'cold glass'
    ]
  },
  {
    id: 'textile-art',
    name: 'Textile Art',
    description: 'Fiber and textile-based art',
    keywords: [
      'textile', 'fiber', 'fabric', 'cloth', 'yarn', 'thread', 'silk',
      'cotton', 'wool', 'linen', 'hemp', 'bamboo', 'synthetic'
    ],
    children: ['weaving', 'embroidery', 'quilting', 'tapestry']
  },
  {
    id: 'weaving',
    name: 'Weaving',
    description: 'Woven textile art',
    keywords: [
      'weaving', 'woven', 'loom', 'warp', 'weft', 'tapestry', 'rug',
      'carpet', 'kilim', 'soumak', 'brocade', 'damask'
    ],
    parent: 'textile-art'
  },
  {
    id: 'embroidery',
    name: 'Embroidery',
    description: 'Embroidered textile art',
    keywords: [
      'embroidery', 'embroidered', 'needlework', 'cross-stitch', 'crewel',
      'goldwork', 'beadwork', 'appliqué', 'patchwork', 'quilting'
    ],
    parent: 'textile-art'
  },
  {
    id: 'digital-art',
    name: 'Digital Art',
    description: 'Computer-generated and digital art',
    keywords: [
      'digital', 'digital art', 'computer', 'software', 'algorithm',
      'generative', 'procedural', 'interactive', 'virtual', 'augmented'
    ],
    children: ['digital-painting', 'digital-photography', 'generative-art', 'interactive-art']
  },
  {
    id: 'digital-painting',
    name: 'Digital Painting',
    description: 'Digital painting and illustration',
    keywords: [
      'digital painting', 'digital illustration', 'photoshop', 'procreate',
      'illustrator', 'corel', 'krita', 'gimp', 'pixel art', 'vector art'
    ],
    parent: 'digital-art'
  },
  {
    id: 'generative-art',
    name: 'Generative Art',
    description: 'Algorithmically generated art',
    keywords: [
      'generative', 'algorithmic', 'procedural', 'code', 'programming',
      'javascript', 'python', 'processing', 'p5.js', 'openframeworks'
    ],
    parent: 'digital-art'
  },
  {
    id: 'interactive-art',
    name: 'Interactive Art',
    description: 'Interactive and responsive art',
    keywords: [
      'interactive', 'responsive', 'sensor', 'motion', 'touch', 'sound',
      'light', 'projection', 'installation', 'kinetic', 'robotic'
    ],
    parent: 'digital-art'
  },
  {
    id: 'mixed-media',
    name: 'Mixed Media',
    description: 'Combined multiple mediums',
    keywords: [
      'mixed media', 'collage', 'assemblage', 'found objects', 'ready-made',
      'installation', 'site-specific', 'performance', 'conceptual'
    ]
  },
  {
    id: 'performance-art',
    name: 'Performance Art',
    description: 'Live performance and time-based art',
    keywords: [
      'performance', 'live', 'temporal', 'durational', 'body', 'movement',
      'dance', 'theater', 'happening', 'event', 'action', 'ritual'
    ]
  },
  {
    id: 'installation-art',
    name: 'Installation Art',
    description: 'Site-specific installation art',
    keywords: [
      'installation', 'site-specific', 'environmental', 'immersive',
      'spatial', 'architectural', 'land art', 'earthworks', 'public art'
    ]
  }
]

// Comprehensive Color Taxonomy
export const COLOR_TAXONOMY: ColorCategory[] = [
  // Primary Colors
  {
    id: 'red',
    name: 'Red',
    hex: '#FF0000',
    rgb: [255, 0, 0],
    hsl: [0, 100, 50],
    category: 'primary',
    keywords: ['red', 'rouge', 'crimson', 'scarlet', 'vermillion']
  },
  {
    id: 'blue',
    name: 'Blue',
    hex: '#0000FF',
    rgb: [0, 0, 255],
    hsl: [240, 100, 50],
    category: 'primary',
    keywords: ['blue', 'bleu', 'azure', 'cerulean', 'navy']
  },
  {
    id: 'yellow',
    name: 'Yellow',
    hex: '#FFFF00',
    rgb: [255, 255, 0],
    hsl: [60, 100, 50],
    category: 'primary',
    keywords: ['yellow', 'jaune', 'gold', 'amber', 'lemon']
  },
  
  // Secondary Colors
  {
    id: 'green',
    name: 'Green',
    hex: '#00FF00',
    rgb: [0, 255, 0],
    hsl: [120, 100, 50],
    category: 'secondary',
    keywords: ['green', 'vert', 'emerald', 'forest', 'lime']
  },
  {
    id: 'orange',
    name: 'Orange',
    hex: '#FFA500',
    rgb: [255, 165, 0],
    hsl: [39, 100, 50],
    category: 'secondary',
    keywords: ['orange', 'or', 'tangerine', 'peach', 'apricot']
  },
  {
    id: 'purple',
    name: 'Purple',
    hex: '#800080',
    rgb: [128, 0, 128],
    hsl: [300, 100, 25],
    category: 'secondary',
    keywords: ['purple', 'violet', 'mauve', 'lavender', 'plum']
  },
  
  // Tertiary Colors
  {
    id: 'red-orange',
    name: 'Red-Orange',
    hex: '#FF4500',
    rgb: [255, 69, 0],
    hsl: [16, 100, 50],
    category: 'tertiary',
    keywords: ['red-orange', 'vermillion', 'coral', 'salmon']
  },
  {
    id: 'yellow-orange',
    name: 'Yellow-Orange',
    hex: '#FF8C00',
    rgb: [255, 140, 0],
    hsl: [33, 100, 50],
    category: 'tertiary',
    keywords: ['yellow-orange', 'amber', 'golden', 'honey']
  },
  {
    id: 'yellow-green',
    name: 'Yellow-Green',
    hex: '#9ACD32',
    rgb: [154, 205, 50],
    hsl: [80, 61, 50],
    category: 'tertiary',
    keywords: ['yellow-green', 'lime', 'chartreuse', 'olive']
  },
  {
    id: 'blue-green',
    name: 'Blue-Green',
    hex: '#008B8B',
    rgb: [0, 139, 139],
    hsl: [180, 100, 27],
    category: 'tertiary',
    keywords: ['blue-green', 'teal', 'turquoise', 'aqua', 'cyan']
  },
  {
    id: 'blue-purple',
    name: 'Blue-Purple',
    hex: '#4B0082',
    rgb: [75, 0, 130],
    hsl: [271, 100, 25],
    category: 'tertiary',
    keywords: ['blue-purple', 'indigo', 'violet', 'periwinkle']
  },
  {
    id: 'red-purple',
    name: 'Red-Purple',
    hex: '#800080',
    rgb: [128, 0, 128],
    hsl: [300, 100, 25],
    category: 'tertiary',
    keywords: ['red-purple', 'magenta', 'fuchsia', 'rose']
  },
  
  // Neutrals
  {
    id: 'black',
    name: 'Black',
    hex: '#000000',
    rgb: [0, 0, 0],
    hsl: [0, 0, 0],
    category: 'neutral',
    keywords: ['black', 'noir', 'ebony', 'charcoal', 'ink']
  },
  {
    id: 'white',
    name: 'White',
    hex: '#FFFFFF',
    rgb: [255, 255, 255],
    hsl: [0, 0, 100],
    category: 'neutral',
    keywords: ['white', 'blanc', 'ivory', 'cream', 'pearl']
  },
  {
    id: 'gray',
    name: 'Gray',
    hex: '#808080',
    rgb: [128, 128, 128],
    hsl: [0, 0, 50],
    category: 'neutral',
    keywords: ['gray', 'grey', 'gris', 'silver', 'ash', 'slate']
  },
  
  // Color Qualities
  {
    id: 'vibrant',
    name: 'Vibrant',
    category: 'quality',
    keywords: ['vibrant', 'bright', 'saturated', 'intense', 'bold']
  },
  {
    id: 'muted',
    name: 'Muted',
    category: 'quality',
    keywords: ['muted', 'subdued', 'soft', 'pale', 'washed']
  },
  {
    id: 'dark',
    name: 'Dark',
    category: 'quality',
    keywords: ['dark', 'deep', 'rich', 'intense', 'shadowy']
  },
  {
    id: 'light',
    name: 'Light',
    category: 'quality',
    keywords: ['light', 'pale', 'soft', 'delicate', 'airy']
  },
  
  // Art Pigments
  {
    id: 'ultramarine',
    name: 'Ultramarine',
    hex: '#4166F5',
    rgb: [65, 102, 245],
    hsl: [230, 90, 61],
    category: 'pigment',
    keywords: ['ultramarine', 'lapis lazuli', 'azure', 'cobalt blue']
  },
  {
    id: 'cadmium-red',
    name: 'Cadmium Red',
    hex: '#E30022',
    rgb: [227, 0, 34],
    hsl: [350, 100, 44],
    category: 'pigment',
    keywords: ['cadmium red', 'cadmium', 'vermilion', 'scarlet']
  },
  {
    id: 'yellow-ochre',
    name: 'Yellow Ochre',
    hex: '#CB9D06',
    rgb: [203, 157, 6],
    hsl: [45, 94, 41],
    category: 'pigment',
    keywords: ['yellow ochre', 'ochre', 'earth', 'sienna']
  },
  {
    id: 'burnt-sienna',
    name: 'Burnt Sienna',
    hex: '#E97451',
    rgb: [233, 116, 81],
    hsl: [14, 78, 62],
    category: 'pigment',
    keywords: ['burnt sienna', 'sienna', 'earth', 'terracotta']
  },
  {
    id: 'raw-umber',
    name: 'Raw Umber',
    hex: '#826644',
    rgb: [130, 102, 68],
    hsl: [33, 31, 39],
    category: 'pigment',
    keywords: ['raw umber', 'umber', 'earth', 'brown']
  },
  
  // Color Temperature
  {
    id: 'warm',
    name: 'Warm',
    category: 'temperature',
    keywords: ['warm', 'hot', 'fiery', 'sunny', 'cozy']
  },
  {
    id: 'cool',
    name: 'Cool',
    category: 'temperature',
    keywords: ['cool', 'cold', 'icy', 'fresh', 'calm']
  },
  {
    id: 'neutral-temp',
    name: 'Neutral Temperature',
    category: 'temperature',
    keywords: ['neutral', 'balanced', 'temperate', 'moderate']
  }
]

// Comprehensive Subject Taxonomy
export const SUBJECT_TAXONOMY: SubjectCategory[] = [
  {
    id: 'nature',
    name: 'Nature',
    description: 'Natural subjects and landscapes',
    keywords: ['nature', 'natural', 'outdoor', 'wilderness', 'countryside'],
    children: ['landscape', 'flora', 'fauna', 'weather', 'geological']
  },
  {
    id: 'landscape',
    name: 'Landscape',
    description: 'Landscape and scenery',
    keywords: [
      'landscape', 'scenery', 'view', 'vista', 'panorama', 'countryside',
      'rural', 'pastoral', 'bucolic', 'idyllic', 'picturesque'
    ],
    parent: 'nature',
    children: ['seascape', 'cityscape', 'mountain', 'forest', 'desert']
  },
  {
    id: 'seascape',
    name: 'Seascape',
    description: 'Marine and coastal landscapes',
    keywords: [
      'seascape', 'ocean', 'sea', 'coast', 'shore', 'beach', 'harbor',
      'port', 'lighthouse', 'cliff', 'tide', 'wave', 'surf'
    ],
    parent: 'landscape'
  },
  {
    id: 'cityscape',
    name: 'Cityscape',
    description: 'Urban landscapes and city views',
    keywords: [
      'cityscape', 'urban', 'city', 'town', 'metropolis', 'skyline',
      'street', 'avenue', 'boulevard', 'plaza', 'square', 'district'
    ],
    parent: 'landscape'
  },
  {
    id: 'mountain',
    name: 'Mountain',
    description: 'Mountainous landscapes',
    keywords: [
      'mountain', 'peak', 'summit', 'ridge', 'valley', 'canyon',
      'cliff', 'rock', 'stone', 'alpine', 'highland', 'foothill'
    ],
    parent: 'landscape'
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Forest and woodland scenes',
    keywords: [
      'forest', 'woodland', 'grove', 'copse', 'thicket', 'jungle',
      'trees', 'wood', 'timber', 'lumber', 'canopy', 'undergrowth'
    ],
    parent: 'landscape'
  },
  {
    id: 'desert',
    name: 'Desert',
    description: 'Desert landscapes',
    keywords: [
      'desert', 'arid', 'dry', 'sand', 'dune', 'oasis', 'cactus',
      'sagebrush', 'mesa', 'butte', 'canyon', 'badlands'
    ],
    parent: 'landscape'
  },
  {
    id: 'flora',
    name: 'Flora',
    description: 'Plant life and vegetation',
    keywords: [
      'flora', 'plants', 'vegetation', 'botanical', 'horticultural',
      'garden', 'park', 'meadow', 'field', 'prairie', 'savanna'
    ],
    parent: 'nature',
    children: ['flowers', 'trees', 'leaves', 'fruit', 'vegetables']
  },
  {
    id: 'flowers',
    name: 'Flowers',
    description: 'Flowering plants and blossoms',
    keywords: [
      'flowers', 'blossoms', 'blooms', 'petals', 'bouquet', 'garden',
      'rose', 'tulip', 'daisy', 'lily', 'orchid', 'sunflower'
    ],
    parent: 'flora'
  },
  {
    id: 'trees',
    name: 'Trees',
    description: 'Trees and woody plants',
    keywords: [
      'trees', 'tree', 'oak', 'pine', 'maple', 'birch', 'willow',
      'cedar', 'elm', 'ash', 'beech', 'chestnut', 'walnut'
    ],
    parent: 'flora'
  },
  {
    id: 'fauna',
    name: 'Fauna',
    description: 'Animal life',
    keywords: [
      'fauna', 'animals', 'wildlife', 'creatures', 'beasts', 'mammals',
      'birds', 'fish', 'insects', 'reptiles', 'amphibians'
    ],
    parent: 'nature',
    children: ['mammals', 'birds', 'fish', 'insects', 'reptiles']
  },
  {
    id: 'mammals',
    name: 'Mammals',
    description: 'Mammalian animals',
    keywords: [
      'mammals', 'mammal', 'dog', 'cat', 'horse', 'cow', 'sheep',
      'goat', 'pig', 'deer', 'bear', 'wolf', 'fox', 'rabbit'
    ],
    parent: 'fauna'
  },
  {
    id: 'birds',
    name: 'Birds',
    description: 'Avian animals',
    keywords: [
      'birds', 'bird', 'eagle', 'hawk', 'owl', 'crow', 'robin',
      'sparrow', 'finch', 'cardinal', 'blue jay', 'woodpecker'
    ],
    parent: 'fauna'
  },
  {
    id: 'fish',
    name: 'Fish',
    description: 'Aquatic animals',
    keywords: [
      'fish', 'salmon', 'trout', 'bass', 'pike', 'perch', 'carp',
      'goldfish', 'tropical fish', 'marine life', 'sea creatures'
    ],
    parent: 'fauna'
  },
  {
    id: 'human',
    name: 'Human',
    description: 'Human subjects and figures',
    keywords: [
      'human', 'person', 'people', 'figure', 'figures', 'portrait',
      'self-portrait', 'group', 'crowd', 'family', 'children'
    ],
    children: ['portrait', 'figure', 'nude', 'group', 'children']
  },
  {
    id: 'portrait',
    name: 'Portrait',
    description: 'Individual human portraits',
    keywords: [
      'portrait', 'portraits', 'head', 'face', 'profile', 'bust',
      'likeness', 'image', 'representation', 'depiction'
    ],
    parent: 'human'
  },
  {
    id: 'figure',
    name: 'Figure',
    description: 'Human figures and bodies',
    keywords: [
      'figure', 'figures', 'body', 'bodies', 'anatomy', 'form',
      'pose', 'gesture', 'movement', 'action', 'stance'
    ],
    parent: 'human'
  },
  {
    id: 'nude',
    name: 'Nude',
    description: 'Nude human figures',
    keywords: [
      'nude', 'nudes', 'naked', 'undressed', 'bare', 'unclothed',
      'classical nude', 'academic nude', 'artistic nude'
    ],
    parent: 'human'
  },
  {
    id: 'architecture',
    name: 'Architecture',
    description: 'Buildings and structures',
    keywords: [
      'architecture', 'building', 'buildings', 'structure', 'structures',
      'construction', 'design', 'facade', 'interior', 'exterior'
    ],
    children: ['religious', 'residential', 'commercial', 'public', 'historical']
  },
  {
    id: 'religious',
    name: 'Religious Architecture',
    description: 'Religious buildings and structures',
    keywords: [
      'church', 'cathedral', 'chapel', 'temple', 'mosque', 'synagogue',
      'shrine', 'monastery', 'abbey', 'basilica', 'sanctuary'
    ],
    parent: 'architecture'
  },
  {
    id: 'residential',
    name: 'Residential Architecture',
    description: 'Homes and residential buildings',
    keywords: [
      'house', 'home', 'cottage', 'mansion', 'villa', 'apartment',
      'condo', 'townhouse', 'bungalow', 'cabin', 'hut'
    ],
    parent: 'architecture'
  },
  {
    id: 'commercial',
    name: 'Commercial Architecture',
    description: 'Commercial and business buildings',
    keywords: [
      'office', 'store', 'shop', 'market', 'mall', 'restaurant',
      'hotel', 'bank', 'factory', 'warehouse', 'skyscraper'
    ],
    parent: 'architecture'
  },
  {
    id: 'still-life',
    name: 'Still Life',
    description: 'Inanimate objects and arrangements',
    keywords: [
      'still life', 'still-life', 'objects', 'arrangement', 'composition',
      'table', 'surface', 'bowl', 'vase', 'fruit', 'vegetables'
    ],
    children: ['vanitas', 'memento-mori', 'food', 'objects', 'flowers']
  },
  {
    id: 'vanitas',
    name: 'Vanitas',
    description: 'Vanitas still life paintings',
    keywords: [
      'vanitas', 'mortality', 'transience', 'skull', 'hourglass',
      'candle', 'book', 'mirror', 'jewelry', 'coins'
    ],
    parent: 'still-life'
  },
  {
    id: 'food',
    name: 'Food',
    description: 'Food and culinary subjects',
    keywords: [
      'food', 'meal', 'dining', 'cooking', 'kitchen', 'restaurant',
      'fruit', 'vegetables', 'bread', 'wine', 'cheese', 'meat'
    ],
    parent: 'still-life'
  },
  {
    id: 'abstract',
    name: 'Abstract',
    description: 'Non-representational subjects',
    keywords: [
      'abstract', 'non-representational', 'non-objective', 'geometric',
      'organic', 'biomorphic', 'hard-edge', 'color field', 'gestural'
    ],
    children: ['geometric', 'organic', 'color-field', 'gestural']
  },
  {
    id: 'geometric',
    name: 'Geometric',
    description: 'Geometric abstract forms',
    keywords: [
      'geometric', 'geometric forms', 'shapes', 'lines', 'angles',
      'circles', 'squares', 'triangles', 'rectangles', 'polygons'
    ],
    parent: 'abstract'
  },
  {
    id: 'organic',
    name: 'Organic',
    description: 'Organic abstract forms',
    keywords: [
      'organic', 'biomorphic', 'natural forms', 'curves', 'flowing',
      'irregular', 'asymmetrical', 'fluid', 'dynamic', 'rhythmic'
    ],
    parent: 'abstract'
  },
  {
    id: 'emotion',
    name: 'Emotion',
    description: 'Emotional and psychological subjects',
    keywords: [
      'emotion', 'emotional', 'feeling', 'mood', 'atmosphere',
      'psychology', 'mental', 'spiritual', 'mystical', 'transcendent'
    ],
    children: ['love', 'sadness', 'joy', 'anger', 'peace', 'fear']
  },
  {
    id: 'love',
    name: 'Love',
    description: 'Love and romantic subjects',
    keywords: [
      'love', 'romance', 'passion', 'desire', 'affection', 'tenderness',
      'intimacy', 'couple', 'embrace', 'kiss', 'heart', 'cupid'
    ],
    parent: 'emotion'
  },
  {
    id: 'sadness',
    name: 'Sadness',
    description: 'Sadness and melancholy subjects',
    keywords: [
      'sadness', 'sad', 'melancholy', 'sorrow', 'grief', 'mourning',
      'tears', 'weeping', 'lamentation', 'despair', 'depression'
    ],
    parent: 'emotion'
  },
  {
    id: 'joy',
    name: 'Joy',
    description: 'Joy and happiness subjects',
    keywords: [
      'joy', 'happiness', 'cheerful', 'merry', 'jubilant', 'ecstatic',
      'celebration', 'festival', 'party', 'dance', 'music', 'laughter'
    ],
    parent: 'emotion'
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Social and cultural subjects',
    keywords: [
      'social', 'society', 'culture', 'community', 'group', 'crowd',
      'gathering', 'event', 'celebration', 'ritual', 'ceremony'
    ],
    children: ['politics', 'war', 'peace', 'protest', 'celebration']
  },
  {
    id: 'politics',
    name: 'Politics',
    description: 'Political subjects and themes',
    keywords: [
      'politics', 'political', 'government', 'power', 'authority',
      'democracy', 'revolution', 'election', 'campaign', 'protest'
    ],
    parent: 'social'
  },
  {
    id: 'war',
    name: 'War',
    description: 'War and conflict subjects',
    keywords: [
      'war', 'battle', 'conflict', 'soldier', 'army', 'military',
      'weapon', 'violence', 'destruction', 'casualty', 'victory'
    ],
    parent: 'social'
  },
  {
    id: 'peace',
    name: 'Peace',
    description: 'Peace and harmony subjects',
    keywords: [
      'peace', 'harmony', 'tranquility', 'serenity', 'calm', 'quiet',
      'meditation', 'prayer', 'reflection', 'contemplation', 'zen'
    ],
    parent: 'social'
  }
]

// Comprehensive Genre Taxonomy
export const GENRE_TAXONOMY: GenreCategory[] = [
  {
    id: 'renaissance',
    name: 'Renaissance',
    description: 'Renaissance art movement',
    keywords: ['renaissance', 'renaissance art', 'classical revival', 'humanism'],
    period: '1400-1600',
    children: ['early-renaissance', 'high-renaissance', 'northern-renaissance']
  },
  {
    id: 'baroque',
    name: 'Baroque',
    description: 'Baroque art movement',
    keywords: ['baroque', 'baroque art', 'dramatic', 'ornate', 'grandiose'],
    period: '1600-1750',
    children: ['early-baroque', 'high-baroque', 'late-baroque']
  },
  {
    id: 'impressionism',
    name: 'Impressionism',
    description: 'Impressionist art movement',
    keywords: ['impressionism', 'impressionist', 'plein air', 'light', 'color'],
    period: '1860-1890',
    children: ['early-impressionism', 'high-impressionism', 'post-impressionism']
  },
  {
    id: 'abstract-expressionism',
    name: 'Abstract Expressionism',
    description: 'Abstract Expressionist movement',
    keywords: ['abstract expressionism', 'action painting', 'color field', 'gestural'],
    period: '1940-1960',
    children: ['action-painting', 'color-field', 'gestural-abstraction']
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    description: 'Contemporary art movement',
    keywords: ['contemporary', 'modern', 'current', 'today', 'present'],
    period: '1970-present',
    children: ['postmodern', 'conceptual', 'installation', 'performance']
  }
]

// Utility functions for taxonomy access
export function getMediaByKeyword(keyword: string): MediaCategory[] {
  return MEDIA_TAXONOMY.filter(media => 
    media.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
  )
}

export function getColorByKeyword(keyword: string): ColorCategory[] {
  return COLOR_TAXONOMY.filter(color => 
    color.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
  )
}

export function getSubjectByKeyword(keyword: string): SubjectCategory[] {
  return SUBJECT_TAXONOMY.filter(subject => 
    subject.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
  )
}

export function getGenreByKeyword(keyword: string): GenreCategory[] {
  return GENRE_TAXONOMY.filter(genre => 
    genre.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
  )
}

export function getAllMediaKeywords(): string[] {
  return MEDIA_TAXONOMY.flatMap(media => media.keywords)
}

export function getAllColorKeywords(): string[] {
  return COLOR_TAXONOMY.flatMap(color => color.keywords)
}

export function getAllSubjectKeywords(): string[] {
  return SUBJECT_TAXONOMY.flatMap(subject => subject.keywords)
}

export function getAllGenreKeywords(): string[] {
  return GENRE_TAXONOMY.flatMap(genre => genre.keywords)
}
