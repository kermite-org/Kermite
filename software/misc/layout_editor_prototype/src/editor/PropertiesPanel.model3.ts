import { createDictionaryFromKeyValues } from '~/base/utils';
import { IKeyEntity } from '~/editor/DataSchema';
import { store } from '~/editor/store';
import { Hook } from '~/qx';

const fallbackKeyEntity: IKeyEntity = {
  id: '--',
  keyId: '--',
  x: 0,
  y: 0,
};

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
  get editKeyEntity(): any {
    return (
      store.design.keyEntities.find(
        (ke) => ke.id === editorState.editTargetKeyEntityId
      ) || fallbackKeyEntity
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
    const ss = slotSources[propKey];
    const slot = editorState.slots[propKey];
    const value = reader.editKeyEntity[propKey];
    slot.originalValue = value;
    slot.editText = ss.reader(value);
    slot.errorText = '';
  }

  setEditText(propKey: string, editText: string) {
    const slot = editorState.slots[propKey];
    const ss = slotSources[propKey];
    slot.editText = editText;
    slot.errorText = ss.validator(editText) || '';
    if (!slot.errorText) {
      const newValue = ss.writer(editText);
      reader.editKeyEntity[propKey] = newValue;
      slot.originalValue = newValue;
      slot.errorText = '';
    }
  }

  setEditTargetKeyEntityKeyId(keyEntityId: string) {
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
    editPropKeys.forEach((pk) => {
      if (editorState.slots[pk].originalValue !== reader.editKeyEntity[pk]) {
        this.pullModelValue(pk);
      }
    });
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
  errorText: string;
  hasError: boolean;
  onFocus(): void;
  resetError(): void;
}

interface IKeyEntityAttrsEditorViewModel {
  readonly slots: IAttributeSlotViewModel[];
  readonly errorText: string;
}

function useKeyEntityAttrsEditorViewModel(): IKeyEntityAttrsEditorViewModel {
  const { currentkeyEntityId } = store;
  Hook.useEffect(
    () => mutations.setEditTargetKeyEntityKeyId(currentkeyEntityId),
    [currentkeyEntityId]
  );

  mutations.updateAllSlots();

  const slots: IAttributeSlotViewModel[] = editPropKeys.map((propKey) => {
    const ss = slotSources[propKey];
    const slot = editorState.slots[propKey];
    return {
      propKey,
      label: ss.label,
      editText: slot.editText,
      setEditText: (text: string) => mutations.setEditText(propKey, text),
      errorText: slot.errorText,
      hasError: !!slot.errorText,
      onFocus: () => mutations.setEditTargetPropKey(propKey),
      resetError: () => mutations.pullModelValue(propKey),
    };
  });

  return {
    slots,
    errorText: reader.editSlotErrorText,
  };
}

interface IPropertyPanelModel {
  readonly keyEntityAttrsVm: IKeyEntityAttrsEditorViewModel;
}

export function usePropertyPanelModel(): IPropertyPanelModel {
  return { keyEntityAttrsVm: useKeyEntityAttrsEditorViewModel() };
}
