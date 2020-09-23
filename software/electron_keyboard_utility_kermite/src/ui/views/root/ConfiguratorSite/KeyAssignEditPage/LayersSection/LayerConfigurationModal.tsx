import { createModal } from '~ui/views/basis/ForegroundModalLayer';
import { ILayerDefaultScheme } from '~defs/ProfileData';
import { h } from '~lib/qx';
import { css } from 'goober';
import {
  reflectFieldValue,
  reflectFieldChecked
} from '~ui/views/common/FormHelpers';
import {
  CommonDialogFrame,
  DialogContentRow,
  DialogButton,
  DialogButtonsRow,
  ClosableOverlay
} from '~ui/views/common/CommonDialogParts';
import {
  cssCommonPropertiesTable,
  cssCommonTextInput
} from '~ui/views/common/commonStyles';

interface ILayerConfigurationModelEditValues {
  layerName: string;
  defaultScheme: ILayerDefaultScheme;
  isShiftLayer: boolean;
}

const DefaultSchemeButton = (props: {
  value: ILayerDefaultScheme;
  isCurrent: boolean;
  setCurrent: () => void;
}) => {
  const { value, isCurrent, setCurrent } = props;

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
  `;
  return (
    <div css={cssButton} data-current={isCurrent} onClick={setCurrent}>
      {value}
    </div>
  );
};

const LayerConfigurationModalContent = (props: {
  editValues: ILayerConfigurationModelEditValues;
  submit(): void;
  close(): void;
  caption: string;
}) => {
  const { editValues, submit, close, caption } = props;
  const defaultSchemeOptions: ILayerDefaultScheme[] = ['block', 'transparent'];
  const cssDefaultSchemeButtonsRow = css`
    display: flex;
  `;

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
                      />
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td>Attached Modifiers</td>
                <td>
                  <label>
                    <input
                      type="checkbox"
                      checked={editValues.isShiftLayer}
                      onChange={reflectFieldChecked(editValues, 'isShiftLayer')}
                    />
                    <span>shift</span>
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
        />
      );
    };
  }
);