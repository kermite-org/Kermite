import { virtualKeyGroupsTable } from './virtualkeyGroupsTable';
import { VirtualKeyTexts } from '~defs/VirtualKeyTexts';
import { editorModel } from '~ui2/models/zAppDomain';

export interface IOperationCardViewModel {
  sig: string;
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
}

interface IOperationEditPartViewModel {
  virtualKeyEntryGroups: IOperationCardViewModel[][];
  layerCallEntries: IOperationCardViewModel[];
}

export function makeOperationEditPartViewModel(): IOperationEditPartViewModel {
  const { editOperation, writeEditOperation } = editorModel;
  const virtualKeyEntryGroups = virtualKeyGroupsTable.map((group) =>
    group.map((vk) => ({
      sig: vk,
      text: VirtualKeyTexts[vk] || '',
      isCurrent:
        editOperation?.type === 'keyInput' && editOperation.virtualKey === vk,
      setCurrent: () => writeEditOperation({ type: 'keyInput', virtualKey: vk })
    }))
  );

  const layerCallEntries = editorModel.profileData.layers
    .filter((la) => la.layerId !== 'la0')
    .map((la) => ({
      sig: la.layerId,
      text: la.layerName,
      isCurrent:
        editOperation?.type === 'layerCall' &&
        editOperation.targetLayerId === la.layerId,
      setCurrent: () =>
        writeEditOperation({
          type: 'layerCall',
          targetLayerId: la.layerId,
          invocationMode: 'hold'
        })
    }));
  return { virtualKeyEntryGroups, layerCallEntries };
}
