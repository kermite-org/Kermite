import {
  ILayerDefaultScheme,
  ModifierVirtualKey,
  addOptionToOptionsArray,
  removeOptionFromOptionsArray,
  VirtualKeyTexts,
} from '~/shared';
import {
  reflectFieldValue,
  reflectChecked,
  reflectValue,
  reflectFieldChecked,
} from '~/ui-common';
import { css } from 'goober';
import { h } from 'qx';
import {
  ClosableOverlay,
  CommonDialogFrame,
  DialogContentRow,
  DialogButtonsRow,
  DialogButton,
} from '~/ui-root/base/dialog/CommonDialogParts';
import { createModal } from '~/ui-root/base/overlay/ForegroundModalLayer';
import {
  cssCommonPropertiesTable,
  cssCommonTextInput,
} from '~/ui-root/views/controls/CommonStyles';
import { DefaultSchemeButton } from '~/ui-root/views/controls/DefaultSchemeButton';

export interface ILayerConfigurationModelEditValues {
  layerName: string;
  defaultScheme: ILayerDefaultScheme;
  attachedModifiers?: ModifierVirtualKey[];
  exclusionGroup: number;
  initialActive: boolean;
}

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
  editValues: ILayerConfigurationModelEditValues,
): AttachedModifierModel {
  const mods = editValues.attachedModifiers || [];

  const modifierVirtualKeys: ModifierVirtualKey[] = [
    'K_Shift',
    'K_Ctrl',
    'K_Alt',
    'K_OS',
  ];

  return modifierVirtualKeys.map((vk) => {
    return {
      sig: vk,
      isEnabled: mods.includes(vk),
      setEnabled(enabled) {
        editValues.attachedModifiers = enabled
          ? addOptionToOptionsArray(mods, vk)
          : removeOptionFromOptionsArray(mods, vk);
      },
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
                        'initialActive',
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
  },
);
