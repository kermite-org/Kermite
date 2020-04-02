import { IProfileData, IKeyboardShape } from './ProfileData';

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

export const testProfileData: IProfileData = {
  revision: 'PRF02',
  featureLevel: 3,
  keyboardShape: keyboardShape_4x3pad,
  layers: [
    {
      layerId: 'la0',
      layerName: 'main'
      // layerRole: 'main'
    },
    {
      layerId: 'la1',
      // layerRole: 'shift',
      layerName: 'shift',
      isShiftLayer: true
      // attachedModifiers: ['K_Shift']
    },
    {
      layerId: 'la2',
      // layerRole: 'shift',
      layerName: 'func'
    }
  ],
  assigns: {
    'la0.ku0': {
      type: 'single2',
      mode: 'single',
      primaryOp: {
        type: 'keyInput',
        virtualKey: 'K_A'
      }
    },
    'la0.ku1': {
      type: 'single2',
      mode: 'dual',
      primaryOp: {
        type: 'keyInput',
        virtualKey: 'K_B'
      },
      secondaryOp: {
        type: 'keyInput',
        virtualKey: 'K_C'
      }
    }
  }
  // keyboardBreedName: '__default'
};
