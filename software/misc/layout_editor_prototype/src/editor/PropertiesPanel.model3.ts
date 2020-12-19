import { createDictionaryFromKeyValues } from '~/base/utils';
import { IKeyEntity } from '~/editor/DataSchema';
import { appState } from '~/editor/store';
import { Hook } from '~/qx';

interface IAttributeSlotSource<T> {
  label: string;
  validator(text: string): string | undefined;
  reader(value: T): string;
  writer(text: string): T;
}

const slotSources: { [key in string]: IAttributeSlotSource<any> } = {
  keyId: {
    label: 'KEY ID',
    validator: (text: string) =>
      text.length < 6 ? undefined : 'must be within 6 characters',
    reader: (value: string) => value,
    writer: (text: string) => text,
  },
  x: {
    label: 'X',
    validator: (text: string) =>
      text.match(/^-?[0-9.]+$/) ? undefined : 'must be a number',
    reader: (value: number) => value.toString(),
    writer: (text: string) => parseFloat(text),
  },
  y: {
    label: 'Y',
    validator: (text: string) =>
      text.match(/^-?[0-9.]+$/) ? undefined : 'must be a number',
    reader: (value: number) => value.toString(),
    writer: (text: string) => parseFloat(text),
  },
};

interface IAttributeSlotState {
  originalValue: any;
  editText: string;
  errorText: string;
}

interface IEditorState {
  editTargetKeyEntityId: string | undefined;
  editTargetPropKey: string | undefined;
  slots: { [key in string]: IAttributeSlotState };
}

const editPropKeys: (keyof IKeyEntity)[] = ['keyId', 'x', 'y'];

const initialSlots = createDictionaryFromKeyValues(
  editPropKeys.map((propKey) => [
    propKey,
    {
      originalValue: undefined,
      editText: '',
      errorText: '',
    },
  ])
);

const initialState: IEditorState = {
  editTargetKeyEntityId: undefined,
  editTargetPropKey: undefined,
  slots: initialSlots,
};

const editorState = initialState;

const reader = new (class {
  get selectedKeyEntity(): IKeyEntity | undefined {
    return appState.editor.design.keyEntities.find(
      (ke) => ke.id === editorState.editTargetKeyEntityId
    );
  }

  get editKeyEntity(): { [key: string]: any } | undefined {
    return appState.editor.design.keyEntities.find(
      (ke) => ke.id === editorState.editTargetKeyEntityId
    );
  }

  get editSlotErrorText() {
    const { slots, editTargetPropKey } = editorState;
    if (editTargetPropKey) {
      const slot = slots[editTargetPropKey];
      if (slot.errorText) {
        const ss = slotSources[editTargetPropKey];
        return `${ss.label} ${slot.errorText}`;
      }
    }
    return '';
  }
})();

const mutations = new (class {
  pullModelValue(propKey: string) {
    const { editKeyEntity } = reader;
    const ss = slotSources[propKey];
    const slot = editorState.slots[propKey];
    if (editKeyEntity) {
      const value = editKeyEntity[propKey];
      slot.originalValue = value;
      slot.editText = ss.reader(value);
      slot.errorText = '';
    } else {
      slot.editText = '';
      slot.errorText = '';
    }
  }

  setEditText(propKey: string, editText: string) {
    const { editKeyEntity } = reader;
    if (!editKeyEntity) {
      return;
    }
    const slot = editorState.slots[propKey];
    const ss = slotSources[propKey];
    slot.editText = editText;
    slot.errorText = ss.validator(editText) || '';
    if (!slot.errorText) {
      const newValue = ss.writer(editText);
      editKeyEntity[propKey] = newValue;
      slot.originalValue = newValue;
      slot.errorText = '';
    }
  }

  setEditTargetKeyEntityKeyId(keyEntityId: string | undefined) {
    editorState.editTargetKeyEntityId = keyEntityId;
    editPropKeys.forEach(this.pullModelValue);
  }

  setEditTargetPropKey(propKey: string) {
    editorState.editTargetPropKey = propKey;
    editPropKeys
      .filter((pk) => pk !== propKey)
      .forEach((pk) => this.pullModelValue(pk));
  }

  updateAllSlots() {
    const { editKeyEntity } = reader;
    if (editKeyEntity) {
      editPropKeys.forEach((pk) => {
        if (editorState.slots[pk].originalValue !== editKeyEntity[pk]) {
          this.pullModelValue(pk);
        }
      });
    }
  }
})();

// M
// ------
// VM

interface IAttributeSlotViewModel {
  propKey: string;
  label: string;
  editText: string;
  setEditText(text: string): void;
  hasError: boolean;
  onFocus(): void;
  resetError(): void;
  canEdit: boolean;
}

interface IKeyEntityAttrsEditorViewModel {
  readonly slots: IAttributeSlotViewModel[];
  readonly errorText: string;
}

function useKeyEntityAttrsEditorViewModel(): IKeyEntityAttrsEditorViewModel {
  const { currentkeyEntityId } = appState.editor;
  Hook.useEffect(
    () => mutations.setEditTargetKeyEntityKeyId(currentkeyEntityId),
    [currentkeyEntityId]
  );

  mutations.updateAllSlots();

  const canEdit = reader.selectedKeyEntity !== undefined;
  const editSlots: IAttributeSlotViewModel[] = editPropKeys.map((propKey) => {
    const ss = slotSources[propKey];
    const slot = editorState.slots[propKey];
    return {
      propKey,
      label: ss.label,
      editText: slot.editText,
      setEditText: (text: string) => mutations.setEditText(propKey, text),
      hasError: !!slot.errorText,
      onFocus: () => mutations.setEditTargetPropKey(propKey),
      resetError: () => mutations.pullModelValue(propKey),
      canEdit,
    };
  });

  return {
    slots: editSlots,
    errorText: reader.editSlotErrorText,
  };
}

interface IPropertyPanelModel {
  readonly keyEntityAttrsVm: IKeyEntityAttrsEditorViewModel;
}

export function usePropertyPanelModel(): IPropertyPanelModel {
  return { keyEntityAttrsVm: useKeyEntityAttrsEditorViewModel() };
}
