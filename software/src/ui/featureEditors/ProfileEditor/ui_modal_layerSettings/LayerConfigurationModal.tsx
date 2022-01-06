import { css, jsx } from 'alumina';
import {
  encodeSingleModifierVirtualKey,
  ILayerDefaultScheme,
  ModifierVirtualKey,
  VirtualKeyTexts,
} from '~/shared';
import { texts } from '~/ui/base';
import {
  ClosableOverlay,
  CommonDialogFrame,
  createModal,
  DialogButton,
  DialogButtonsRow,
  DialogContentRow,
} from '~/ui/components';
import {
  cssCommonPropertiesTable,
  cssCommonTextInput,
  DefaultSchemeButton,
} from '~/ui/elements';
import {
  reflectFieldValue,
  reflectChecked,
  reflectValue,
  reflectFieldChecked,
} from '~/ui/utils';

export interface ILayerConfigurationModelEditValues {
  layerName: string;
  defaultScheme: ILayerDefaultScheme;
  attachedModifiers: number;
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
  const mods = editValues.attachedModifiers;

  const modifierVirtualKeys: ModifierVirtualKey[] = [
    'K_Shift',
    'K_Ctrl',
    'K_Alt',
    'K_Gui',
  ];

  return modifierVirtualKeys.map((vk) => {
    const bitFlag = encodeSingleModifierVirtualKey(vk);
    return {
      sig: vk,
      isEnabled: (mods & bitFlag) > 0,
      setEnabled(enabled) {
        editValues.attachedModifiers = enabled
          ? mods | bitFlag
          : mods & ~bitFlag;
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
      <CommonDialogFrame caption={caption} close={close}>
        <DialogContentRow>
          <table class={cssCommonPropertiesTable}>
            <tbody>
              <tr>
                <td data-hint={texts.assignerLayerModalHint.layerName}>
                  {texts.assignerLayerModal.layerName}
                </td>
                <td>
                  <input
                    type="text"
                    class={cssCommonTextInput}
                    value={editValues.layerName}
                    onChange={reflectFieldValue(editValues, 'layerName')}
                    spellcheck={'false' as any}
                  />
                </td>
              </tr>
              <tr>
                <td data-hint={texts.assignerLayerModalHint.defaultScheme}>
                  {texts.assignerLayerModal.defaultScheme}
                </td>
                <td>
                  <div class={cssDefaultSchemeButtonsRow}>
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
                <td data-hint={texts.assignerLayerModalHint.attachedModifiers}>
                  {texts.assignerLayerModal.attachedModifiers}
                </td>
                <td>
                  <div class={cssAttachedModifiersBox}>
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
                <td data-hint={texts.assignerLayerModalHint.exclusionGroup}>
                  {texts.assignerLayerModal.exclusionGroup}
                </td>
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
                <td data-hint={texts.assignerLayerModalHint.initialActive}>
                  {texts.assignerLayerModal.initialActive}
                </td>
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
