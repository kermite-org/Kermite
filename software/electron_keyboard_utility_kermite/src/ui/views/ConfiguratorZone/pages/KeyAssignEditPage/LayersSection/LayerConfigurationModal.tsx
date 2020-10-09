import { css } from 'goober';
import { h } from '~lib/qx';
import { ILayerDefaultScheme } from '~defs/ProfileData';
import { VirtualKeyTexts } from '~defs/VirtualKeyTexts';
import { ModifierVirtualKey } from '~defs/VirtualKeys';
import {
  addOptionToOptionsArray,
  removeOptionFromOptionsArray
} from '~funcs/Utils';
import {
  reflectChecked,
  reflectFieldChecked,
  reflectFieldValue,
  reflectValue
} from '~ui/views/base/FormHelpers';
import {
  cssCommonPropertiesTable,
  cssCommonTextInput
} from '~ui/views/base/commonStyles';
import {
  CommonDialogFrame,
  DialogContentRow,
  DialogButton,
  DialogButtonsRow,
  ClosableOverlay
} from '~ui/views/base/dialog/CommonDialogParts';
import { createModal } from '~ui/views/base/layout/ForegroundModalLayer';

export interface ILayerConfigurationModelEditValues {
  layerName: string;
  defaultScheme: ILayerDefaultScheme;
  attachedModifiers?: ModifierVirtualKey[];
  exclusionGroup: number;
  initialActive: boolean;
}

const DefaultSchemeButton = (props: {
  value: ILayerDefaultScheme;
  isCurrent: boolean;
  setCurrent: () => void;
  disabled: boolean;
}) => {
  const { value, isCurrent, setCurrent, disabled } = props;

  const cssButton = css`
    min-width: 80px;
    height: 26px;
    padding: 0 8px;
    cursor: pointer;
    border: solid 1px #048;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &[data-current] {
      background: #0cf;
    }
    &:hover {
      opacity: 0.8;
    }

    &[data-disabled] {
      pointer-events: none;
      color: #888;
      background: #ddd;
      border: solid 1px #666;
    }
  `;
  return (
    <div
      css={cssButton}
      data-current={isCurrent}
      onClick={setCurrent}
      data-disabled={disabled}
    >
      {value}
    </div>
  );
};

const defaultSchemeOptions: ILayerDefaultScheme[] = ['transparent', 'block'];
const exclusionGroupOptions: number[] = Array(8)
  .fill(undefined)
  .map((_, idx) => idx);

type AttachedModifierModel = {
  sig: ModifierVirtualKey;
  isEnabled: boolean;
  setEnabled(enabled: boolean): void;
}[];

function makeAttachedModifiersModel(
  editValues: ILayerConfigurationModelEditValues
): AttachedModifierModel {
  const mods = editValues.attachedModifiers || [];

  const modifierVirtualKeys: ModifierVirtualKey[] = [
    'K_Shift',
    'K_Ctrl',
    'K_Alt',
    'K_OS'
  ];

  return modifierVirtualKeys.map((vk) => {
    return {
      sig: vk,
      isEnabled: mods.includes(vk),
      setEnabled(enabled) {
        editValues.attachedModifiers = enabled
          ? addOptionToOptionsArray(mods, vk)
          : removeOptionFromOptionsArray(mods, vk);
      }
    };
  });
}

const LayerConfigurationModalContent = (props: {
  editValues: ILayerConfigurationModelEditValues;
  submit(): void;
  close(): void;
  caption: string;
  isRootLayer: boolean;
}) => {
  const { editValues, submit, close, caption, isRootLayer } = props;

  const cssDefaultSchemeButtonsRow = css`
    display: flex;
  `;

  const cssAttachedModifiersBox = css`
    > * + * {
      margin-left: 5px;
    }
  `;

  const canEditDefaultScheme = !isRootLayer;
  const canEditAttachedModifiers = !isRootLayer;

  const modsModel = makeAttachedModifiersModel(editValues);

  return (
    <ClosableOverlay close={close}>
      <CommonDialogFrame caption={caption}>
        <DialogContentRow>
          <table css={cssCommonPropertiesTable}>
            <tbody>
              <tr>
                <td>Layer Name</td>
                <td>
                  <input
                    type="text"
                    css={cssCommonTextInput}
                    value={editValues.layerName}
                    onChange={reflectFieldValue(editValues, 'layerName')}
                  />
                </td>
              </tr>
              <tr>
                <td>Default Scheme</td>
                <td>
                  <div css={cssDefaultSchemeButtonsRow}>
                    {defaultSchemeOptions.map((ds) => (
                      <DefaultSchemeButton
                        key={ds}
                        value={ds}
                        isCurrent={editValues.defaultScheme === ds}
                        setCurrent={() => (editValues.defaultScheme = ds)}
                        disabled={!canEditDefaultScheme}
                      />
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td>Attached Modifiers</td>
                <td>
                  <div css={cssAttachedModifiersBox}>
                    {modsModel.map((mod) => {
                      return (
                        <label key={mod.sig}>
                          <input
                            type="checkbox"
                            checked={mod.isEnabled}
                            onChange={reflectChecked(mod.setEnabled)}
                            disabled={!canEditAttachedModifiers}
                          />
                          <span>{VirtualKeyTexts[mod.sig]}</span>
                        </label>
                      );
                    })}
                  </div>
                </td>
              </tr>
              <tr>
                <td>Exclusion Group</td>
                <td>
                  <select
                    value={editValues.exclusionGroup.toString()}
                    onChange={reflectValue((strValue) => {
                      editValues.exclusionGroup = parseInt(strValue);
                    })}
                  >
                    {exclusionGroupOptions.map((groupIndex) => (
                      <option key={groupIndex} value={groupIndex.toString()}>
                        {groupIndex}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td>Initial Active</td>
                <td>
                  <label>
                    <input
                      type="checkbox"
                      checked={editValues.initialActive}
                      onChange={reflectFieldChecked(
                        editValues,
                        'initialActive'
                      )}
                    />
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </DialogContentRow>
        <DialogButtonsRow>
          <DialogButton onClick={submit}>OK</DialogButton>
        </DialogButtonsRow>
      </CommonDialogFrame>
    </ClosableOverlay>
  );
};

export const callLayerConfigurationModal = createModal(
  (args: {
    sourceValues: ILayerConfigurationModelEditValues;
    caption: string;
    isRootLayer: boolean;
  }) => {
    const editValues = args.sourceValues;
    return (props: {
      close: (result: ILayerConfigurationModelEditValues | undefined) => void;
    }) => {
      const submit = () => props.close(editValues);
      const close = () => props.close(undefined);
      return (
        <LayerConfigurationModalContent
          editValues={editValues}
          submit={submit}
          close={close}
          caption={args.caption}
          isRootLayer={args.isRootLayer}
        />
      );
    };
  }
);
