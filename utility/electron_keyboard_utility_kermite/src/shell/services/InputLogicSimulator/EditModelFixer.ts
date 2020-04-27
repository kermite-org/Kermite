import { IEditModel } from '~defs/data';
import { VirtualKey } from '~defs/VirtualKeys';
import { getKeyboardShapeByBreedName } from '~ui/view/WidgetSite/KeyboardShapes';
import { createDictionaryFromKeyValues } from '~funcs/Utils';

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
  editModel: IEditModel
): IEditModel {
  const keyAssigns = { ...editModel.keyAssigns };
  for (let i = 0; i < 48; i++) {
    const addr0 = `ku${i}.la0.pri`;
    const addr1 = `ku${i}.la1.pri`;
    const assign = keyAssigns[addr0];
    if (
      assign &&
      assign.type === 'keyInput' &&
      alphabetVirtualKeys.includes(assign.virtualKey) &&
      assign.modifiers === undefined &&
      keyAssigns[addr1] === undefined
    ) {
      keyAssigns[addr1] = { ...assign, modifiers: ['K_Shift'] };
    }
  }
  // console.log(JSON.stringify(keyAssigns, null, ' '));
  return { ...editModel, keyAssigns };
}

export function createKeyIndexToKeyUnitIdTable(
  editModel: IEditModel
): { [KeyIndex: number]: string } {
  const keyboardShape = getKeyboardShapeByBreedName(editModel.breedName);
  return createDictionaryFromKeyValues(
    keyboardShape.keyPositions.map(ku => [ku.pk, ku.id])
  );
}
