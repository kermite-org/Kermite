import { IProfileData, IKeyboardShape } from './ProfileData';

const keyboardShape_4x3pad: IKeyboardShape = {
  breedName: '4x3pad',
  keyUnits: [
    { id: 'ku3', x: 0, y: 19, r: 0, keyIndex: 0 },
    { id: 'ku2', x: 19, y: 19, r: 0, keyIndex: 1 },
    { id: 'ku1', x: 38, y: 19, r: 0, keyIndex: 2 },
    { id: 'ku0', x: 57, y: 19, r: 0, keyIndex: 3 },
    { id: 'ku10', x: 0, y: 38, r: 0, keyIndex: 4 },
    { id: 'ku9', x: 19, y: 38, r: 0, keyIndex: 5 },
    { id: 'ku8', x: 38, y: 38, r: 0, keyIndex: 6 },
    { id: 'ku7', x: 57, y: 38, r: 0, keyIndex: 7 },
    { id: 'ku16', x: 0, y: 57, r: 0, keyIndex: 8 },
    { id: 'ku15', x: 19, y: 57, r: 0, keyIndex: 9 },
    { id: 'ku14', x: 38, y: 57, r: 0, keyIndex: 10 },
    { id: 'ku13', x: 57, y: 57, r: 0, keyIndex: 11 }
  ],
  bodyPathMarkupText: ['M -20,0', 'L 100,0', 'L 100,80', 'L -20,80', 'z'].join(
    ' '
  )
};

export const testProfileData: IProfileData = {
  revision: 'PRF02',
  // featureLevel: 3,
  keyboardShape: keyboardShape_4x3pad,
  layers: [
    {
      layerId: 'la0',
      layerName: 'main',
      defaultScheme: 'block'
      // layerRole: 'main'
    },
    {
      layerId: 'la1',
      // layerRole: 'shift',
      layerName: 'shift',
      isShiftLayer: true,
      defaultScheme: 'block'
      // attachedModifiers: ['K_Shift']
    },
    {
      layerId: 'la2',
      // layerRole: 'shift',
      layerName: 'func',
      defaultScheme: 'block'
    }
  ],
  assigns: {
    'la0.ku0': {
      type: 'single',
      // mode: 'dual',
      op: {
        type: 'keyInput',
        virtualKey: 'K_A'
      }
    },
    'la0.ku1': {
      type: 'single',
      // mode: 'dual',
      op: {
        type: 'keyInput',
        virtualKey: 'K_B'
      }
      // secondaryOp: {
      //   type: 'keyInput',
      //   virtualKey: 'K_C'
      // }
    }
  }
  // keyboardBreedName: '__default'
};
