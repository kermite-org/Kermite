import { css } from 'goober';
import { IKeyboardDesign, IKeyEntity } from '~/DataSchema';
import { reflectValue } from '~/FormHelpers';
import { h, Hook } from '~/qx';

const design: IKeyboardDesign = {
  keyEntities: [
    {
      id: 'key0',
      x: 0,
      y: 0,
    },
    {
      id: 'key1',
      x: 22,
      y: 0,
    },
    {
      id: 'key2',
      x: 44,
      y: 0,
    },
  ],
};

let currentkeyId = 'key0';

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
}
interface IPropertyEditorViewModel {
  errorText: string;
  resetError(): void;
  slots: IAttributeSlotViewModel[];
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

  let originalText = source.reader(keyEntity[propKey]);
  let editText = originalText;
  let errorText: string | undefined;
  let focusedCallback: (() => void) | undefined;
  let valueChangedCallback: ((value: any) => void) | undefined;

  function affectEditTextToKeyEntityAttribute() {
    errorText = source.validator(editText);
    if (!errorText) {
      const newValue = source.writer(editText);
      // console.log({ _editText: editText, newValue });
      (keyEntity as any)[propKey] = newValue;
      originalText = editText;
      valueChangedCallback?.(newValue);
    }
  }

  return {
    propKey,
    label,
    get editText() {
      return editText;
    },
    setEditText(text: string) {
      editText = text;
      affectEditTextToKeyEntityAttribute();
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
  };
}

function makePropertyEditorViewModel(ke: IKeyEntity): IPropertyEditorViewModel {
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
        currentkeyId = newValue;
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
  };
}

interface IDesignAttributeTextInputLineProps {
  label: string;
  editText: string;
  setEditText(text: string): void;
  hasError: boolean;
  onFocus(): void;
  resetError(): void;
}

const DesignAttributeTextInputLine = ({
  label,
  editText,
  setEditText,
  hasError,
  onFocus,
  resetError,
}: IDesignAttributeTextInputLineProps) => {
  const cssInput = css`
    &[data-has-error] {
      background: rgba(255, 0, 0, 0.3);
    }
  `;

  return (
    <div>
      <label>{label}</label>
      <input
        css={cssInput}
        type="text"
        value={editText}
        onInput={reflectValue(setEditText)}
        onFocus={onFocus}
        data-has-error={hasError}
      />
      {hasError && <button onClick={resetError}>x</button>}
    </div>
  );
};

const PropertiesPanel = () => {
  const vm = Hook.useMemo(() => {
    const selectedKeyEntity = design.keyEntities.find(
      (ke) => ke.id === currentkeyId
    );
    return makePropertyEditorViewModel(selectedKeyEntity!);
  }, [currentkeyId]);

  const cssPropertiesPanel = css`
    label {
      display: inline-block;
      width: 60px;
    }
    input {
      width: 60px;
    }

    display: flex;
    flex-direction: column;
    height: 100%;

    > .editZone {
      flex-grow: 1;
    }

    > .errorZone {
      > .errorText {
        color: red;
      }
    }
  `;

  return (
    <div css={cssPropertiesPanel}>
      <div className="editZone">
        {vm.slots.map((slot) => (
          <DesignAttributeTextInputLine key={slot.propKey} {...slot} />
        ))}
      </div>
      <div qxIf={!!vm.errorText} className="errorZone">
        <span className="errorText">{vm.errorText}</span>
      </div>
    </div>
  );
};

const EditSvgView = () => {
  const cssSvg = css`
    border: solid 1px #888;
  `;

  const cssKeyRect = css`
    fill: rgba(255, 255, 255, 0.3);
    stroke: #666;
    cursor: pointer;

    &[data-selected] {
      stroke: #4bb;
    }
  `;

  return (
    <svg width={600} height={400} css={cssSvg} viewBox="-150 -100 300 200">
      {design.keyEntities.map((ke) => {
        const sz = 20;
        const hsz = sz / 2;

        const onClick = () => {
          currentkeyId = ke.id;
        };
        return (
          <rect
            key={ke.id}
            x={ke.x - hsz}
            y={ke.y - hsz}
            width={sz}
            height={sz}
            css={cssKeyRect}
            data-selected={ke.id === currentkeyId}
            onClick={onClick}
          ></rect>
        );
      })}
    </svg>
  );
};

export const PageRoot = () => {
  const cssPageRoot = css`
    border: solid 2px #f08;
    padding: 10px;
    height: 100%;

    > .mainRow {
      display: flex;

      > .sideColumn {
        width: 240px;
        border: solid 1px #888;
      }
    }
  `;

  return (
    <div css={cssPageRoot}>
      <div>layout editor proto</div>
      <div class="mainRow">
        <EditSvgView />
        <div class="sideColumn">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
};
