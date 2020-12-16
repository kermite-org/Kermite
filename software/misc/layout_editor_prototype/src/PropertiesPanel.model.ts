import { IKeyEntity } from '~/DataSchema';
import { Hook } from '~/qx';
import { store } from '~/store';

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

interface IAttributeSlotViewModelEx extends IAttributeSlotViewModel {
  onFocused(cb: () => void): void;
  onValueChanged(cb: (value: any) => void): void;
  update(): void;
}

interface IAttributeSlotSource<T> {
  propKey: keyof IKeyEntity;
  label: string;
  validator(text: string): string | undefined;
  reader(value: T): string;
  writer(text: string): T;
}

const slotSources: IAttributeSlotSource<any>[] = [
  {
    propKey: 'id',
    label: 'KEY ID',
    validator: (text: string) =>
      text.length < 6 ? undefined : 'must be within 6 characters',
    reader: (value: string) => value,
    writer: (text: string) => text,
  },
  {
    propKey: 'x',
    label: 'X',
    validator: (text: string) =>
      text.match(/^-?[0-9.]+$/) ? undefined : 'must be a number',
    reader: (value: number) => value.toString(),
    writer: (text: string) => parseFloat(text),
  },
  {
    propKey: 'y',
    label: 'Y',
    validator: (text: string) =>
      text.match(/^-?[0-9.]+$/) ? undefined : 'must be a number',
    reader: (value: number) => value.toString(),
    writer: (text: string) => parseFloat(text),
  },
];

function makeAttributeSlotViewModel(
  source: IAttributeSlotSource<any>,
  keyEntity: IKeyEntity
): IAttributeSlotViewModelEx {
  const { propKey, label } = source;

  let originalValue: any;
  let originalText: string = '';
  let editText: string = '';
  let errorText: string | undefined;

  function pullModelValue() {
    originalValue = keyEntity[propKey];
    originalText = source.reader(originalValue);
    editText = originalText;
  }

  let focusedCallback: (() => void) | undefined;
  let valueChangedCallback: ((value: any) => void) | undefined;

  function affectEditTextToModelValue() {
    errorText = source.validator(editText);
    if (!errorText) {
      const newValue = source.writer(editText);
      // console.log({ _editText: editText, newValue });
      (keyEntity as any)[propKey] = newValue;
      originalText = editText;
      valueChangedCallback?.(newValue);
    }
  }

  pullModelValue();

  return {
    propKey,
    label,
    get editText() {
      return editText;
    },
    setEditText(text: string) {
      editText = text;
      affectEditTextToModelValue();
    },
    get errorText() {
      return errorText || '';
    },
    resetError() {
      if (errorText) {
        editText = originalText;
        errorText = undefined;
      }
    },
    get hasError() {
      return !!errorText;
    },
    onFocus() {
      focusedCallback?.();
    },
    onFocused(cb) {
      focusedCallback = cb;
    },
    onValueChanged(cb) {
      valueChangedCallback = cb;
    },
    update() {
      const currentValue = keyEntity[propKey];
      if (originalValue !== currentValue) {
        pullModelValue();
      }
    },
  };
}

interface IKeyEntityAttrsEditorViewModel {
  errorText: string;
  resetError(): void;
  slots: IAttributeSlotViewModel[];
  update(): void;
}

export function makePropertyEditorViewModel(
  ke: IKeyEntity
): IKeyEntityAttrsEditorViewModel {
  // console.log(`makePropertyEditorViewModel for ${ke.id}`);

  const allSlots: IAttributeSlotViewModelEx[] = slotSources.map((ss) => {
    return makeAttributeSlotViewModel(ss, ke);
  });

  let currentSlot: IAttributeSlotViewModelEx | undefined;

  const onSlotFocused = (slot: IAttributeSlotViewModelEx) => {
    allSlots.forEach((sl) => {
      if (sl !== slot) {
        sl.resetError();
      }
    });
    currentSlot = slot;
  };

  allSlots.forEach((slot) => {
    slot.onFocused(() => onSlotFocused(slot));
    slot.onValueChanged((newValue) => {
      if (slot.propKey === 'id') {
        store.currentkeyId = newValue;
      }
    });
  });

  return {
    slots: allSlots,
    get errorText() {
      if (currentSlot?.errorText) {
        return `${currentSlot.label} ${currentSlot.errorText}`;
      }
      return '';
    },
    resetError() {
      currentSlot?.resetError();
    },
    update() {
      allSlots.forEach((slot) => slot.update());
    },
  };
}

interface IPropertyPanelModel {
  keyEntityAttrsVm: IKeyEntityAttrsEditorViewModel;
}

export function usePropertyPanelModel(): IPropertyPanelModel {
  const { design, currentkeyId } = store;

  const keyEntityAttrsVm = Hook.useMemo(() => {
    const selectedKeyEntity = design.keyEntities.find(
      (ke) => ke.id === currentkeyId
    );
    return makePropertyEditorViewModel(selectedKeyEntity!);
  }, [currentkeyId]);

  keyEntityAttrsVm.update();

  return {
    keyEntityAttrsVm,
  };
}
