import { IProfileData, keyboardShape_fallbackData } from '~defs/ProfileData';
import { VirtualKey } from '~defs/VirtualKeys';
import { createDictionaryFromKeyValues } from '~funcs/Utils';
import { keyboardShapesProvider } from '~shell/services/KeyboardShapesProvider';

const alphabetVirtualKeys: VirtualKey[] = [
  'K_A',
  'K_B',
  'K_C',
  'K_D',
  'K_E',
  'K_F',
  'K_G',
  'K_H',
  'K_I',
  'K_J',
  'K_K',
  'K_L',
  'K_M',
  'K_N',
  'K_O',
  'K_P',
  'K_Q',
  'K_R',
  'K_S',
  'K_T',
  'K_U',
  'K_V',
  'K_W',
  'K_X',
  'K_Y',
  'K_Z'
];

export function completeEditModelForShiftLayer(
  editModel: IProfileData
): IProfileData {
  const assigns = { ...editModel.assigns };
  for (let i = 0; i < 48; i++) {
    const addr0 = `ku${i}.la0.pri`;
    const addr1 = `ku${i}.la1.pri`;
    const assign = assigns[addr0];
    if (
      assign &&
      assign.type === 'single' &&
      assign.op &&
      assign.op.type === 'keyInput' &&
      alphabetVirtualKeys.includes(assign.op.virtualKey) &&
      assign.op.attachedModifiers === undefined &&
      assigns[addr1] === undefined
    ) {
      assigns[addr1] = {
        ...assign,
        op: { ...assign.op, attachedModifiers: ['K_Shift'] }
      };
    }
  }
  // console.log(JSON.stringify(keyAssigns, null, ' '));
  return { ...editModel, assigns } as IProfileData;
}

export function createKeyIndexToKeyUnitIdTable(
  editModel: IProfileData
): { [KeyIndex: number]: string } {
  const keyboardShape =
    keyboardShapesProvider.getKeyboardShapeByBreedName(
      editModel.keyboardShape.breedName
    ) || keyboardShape_fallbackData;
  return createDictionaryFromKeyValues(
    keyboardShape.keyUnits.map((ku) => [ku.keyIndex, ku.id])
  );
}
