import { editorModel } from '~models/EditorModel';
import { virtualKeyGroupsTable } from './virtualkeyGroupsTable';
import { VirtualKeyTexts } from '~defs/VirtualKeyTexts';

export interface IOperationCardViewModel {
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
}

interface IOperationEditPartViewModel {
  virtualKeyEntryGroups: IOperationCardViewModel[][];
}

export function makeOperationEditPartViewModel(): IOperationEditPartViewModel {
  const { editOperation, writeEditOperation } = editorModel;
  const virtualKeyEntryGroups = virtualKeyGroupsTable.map((group) =>
    group.map((vk) => ({
      text: VirtualKeyTexts[vk] || '',
      isCurrent:
        editOperation?.type === 'keyInput' && editOperation.virtualKey === vk,
      setCurrent: () =>
        writeEditOperation({ type: 'keyInput', virtualKey: vk }),
    }))
  );
  return { virtualKeyEntryGroups };
}
