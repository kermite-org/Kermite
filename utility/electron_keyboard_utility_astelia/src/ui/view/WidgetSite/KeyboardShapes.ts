export interface IKeyUnitPositionEntry {
  id: string;
  x: number;
  y: number;
  r: number;
  pk: number;
}

export interface IKeyboardShape {
  bleedName: string;
  keyPositions: IKeyUnitPositionEntry[];
  bodyPathMarkupText: string;
}

const keyboardShape_fallbackData: IKeyboardShape = {
  bleedName: 'none',
  keyPositions: [],
  bodyPathMarkupText: ''
};

const keyboardShape_astalia: IKeyboardShape = {
  bleedName: 'astelia',
  keyPositions: [
    { id: 'ku0', x: -21.259478, y: 25.185357, r: 9, pk: 0 },
    { id: 'ku1', x: -40.027745, y: 22.233922, r: 9, pk: 1 },
    { id: 'ku2', x: -58.796012, y: 19.282486, r: 9, pk: 2 },
    { id: 'ku3', x: -82.0, y: 19.0, r: 0, pk: 3 },
    { id: 'ku4', x: -101.0, y: 19.0, r: 0, pk: 4 },
    { id: 'ku5', x: -120.0, y: 19.0, r: 0, pk: 5 },

    { id: 'ku6', x: -24.231733, y: 43.951435, r: 9, pk: 6 },
    { id: 'ku7', x: -43.0, y: 41.0, r: 9, pk: 7 },
    { id: 'ku8', x: -61.768267, y: 38.048565, r: 9, pk: 8 },
    { id: 'ku9', x: -83.5, y: 38.0, r: 0, pk: 9 },
    { id: 'ku10', x: -102.5, y: 38.0, r: 0, pk: 10 },
    { id: 'ku11', x: -121.5, y: 38.0, r: 0, pk: 11 },

    { id: 'ku12', x: -27.203988, y: 62.717514, r: 9, pk: 12 },
    { id: 'ku13', x: -45.972255, y: 59.766078, r: 9, pk: 13 },
    { id: 'ku14', x: -64.740522, y: 56.814643, r: 9, pk: 14 },
    { id: 'ku15', x: -85.0, y: 57.0, r: 0, pk: 15 },
    { id: 'ku16', x: -104.0, y: 57.0, r: 0, pk: 16 },
    { id: 'ku17', x: -123.0, y: 57.0, r: 0, pk: 17 },

    { id: 'ku18', x: -23.246233, y: 87.128689, r: 9, pk: 18 },
    { id: 'ku19', x: -43.0, y: 84.0, r: 9, pk: 19 },
    { id: 'ku20', x: -62.753767, y: 80.871311, r: 9, pk: 20 },
    { id: 'ku21', x: -84.0, y: 79.0, r: 0, pk: 21 },
    { id: 'ku22', x: -104.0, y: 79.0, r: 0, pk: 22 },
    { id: 'ku23', x: -124.0, y: 79.0, r: 0, pk: 23 },

    { id: 'ku24', x: 21.259478, y: 25.185357, r: -9, pk: 24 },
    { id: 'ku25', x: 40.027745, y: 22.233922, r: -9, pk: 25 },
    { id: 'ku26', x: 58.796012, y: 19.282486, r: -9, pk: 26 },
    { id: 'ku27', x: 82.0, y: 19.0, r: 0, pk: 27 },
    { id: 'ku28', x: 101.0, y: 19.0, r: 0, pk: 28 },
    { id: 'ku29', x: 120.0, y: 19.0, r: 0, pk: 29 },

    { id: 'ku30', x: 24.231733, y: 43.951435, r: -9, pk: 30 },
    { id: 'ku31', x: 43.0, y: 41.0, r: -9, pk: 31 },
    { id: 'ku32', x: 61.768267, y: 38.048565, r: -9, pk: 32 },
    { id: 'ku33', x: 83.5, y: 38.0, r: 0, pk: 33 },
    { id: 'ku34', x: 102.5, y: 38.0, r: 0, pk: 34 },
    { id: 'ku35', x: 121.5, y: 38.0, r: 0, pk: 35 },

    { id: 'ku36', x: 27.203988, y: 62.717514, r: -9, pk: 36 },
    { id: 'ku37', x: 45.972255, y: 59.766078, r: -9, pk: 37 },
    { id: 'ku38', x: 64.740522, y: 56.814643, r: -9, pk: 38 },
    { id: 'ku39', x: 85.0, y: 57.0, r: 0, pk: 39 },
    { id: 'ku40', x: 104.0, y: 57.0, r: 0, pk: 40 },
    { id: 'ku41', x: 123.0, y: 57.0, r: 0, pk: 41 },

    { id: 'ku42', x: 23.246233, y: 87.128689, r: -9, pk: 42 },
    { id: 'ku43', x: 43.0, y: 84.0, r: -9, pk: 43 },
    { id: 'ku44', x: 62.753767, y: 80.871311, r: -9, pk: 44 },
    { id: 'ku45', x: 84.0, y: 79.0, r: 0, pk: 45 },
    { id: 'ku46', x: 104.0, y: 79.0, r: 0, pk: 46 },
    { id: 'ku47', x: 124.0, y: 79.0, r: 0, pk: 47 }
  ],
  bodyPathMarkupText: [
    'M 0,0',
    'L 139,0',
    'A 4,4 0 0 1 143,4',
    'L 143,91',
    'A 4,4 0 0 1 139,95',
    'L 25,107',
    'L 0,107',
    'L -25,107',
    'L -139,95',
    'A 4,4 0 0 1 -143,91',
    'L -143,4',
    'A 4,4 0 0 1 -139 0',
    'z'
  ].join(' ')
};

const keyboardShape_4x3pad: IKeyboardShape = {
  bleedName: '4x3pad',
  keyPositions: [
    { id: 'ku1', x: 57, y: 19, r: 0, pk: 3 },
    { id: 'ku2', x: 38, y: 19, r: 0, pk: 2 },
    { id: 'ku3', x: 19, y: 19, r: 0, pk: 1 },
    { id: 'ku4', x: 0, y: 19, r: 0, pk: 0 },

    { id: 'ku7', x: 57, y: 38, r: 0, pk: 7 },
    { id: 'ku8', x: 38, y: 38, r: 0, pk: 6 },
    { id: 'ku9', x: 19, y: 38, r: 0, pk: 5 },
    { id: 'ku10', x: 0, y: 38, r: 0, pk: 4 },

    { id: 'ku13', x: 57, y: 57, r: 0, pk: 11 },
    { id: 'ku14', x: 38, y: 57, r: 0, pk: 10 },
    { id: 'ku15', x: 19, y: 57, r: 0, pk: 9 },
    { id: 'ku16', x: 0, y: 57, r: 0, pk: 8 }
  ],
  bodyPathMarkupText: ['M -20,0', 'L 100,0', 'L 100,80', 'L -20,80', 'z'].join(
    ' '
  )
};

const shapes = [keyboardShape_astalia, keyboardShape_4x3pad];

export function getAvailableBreedNames(): string[] {
  return shapes.map(shape => shape.bleedName);
}

export function getKeyboardShapeByBreedName(breedName: string): IKeyboardShape {
  return (
    shapes.find(shape => shape.bleedName === breedName) ||
    keyboardShape_fallbackData
  );
}
