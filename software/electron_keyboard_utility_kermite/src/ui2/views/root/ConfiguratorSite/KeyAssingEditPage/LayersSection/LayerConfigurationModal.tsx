import { createModal } from '~ui2/views/basis/ForegroundModalLayer';
import { ILayerDefaultScheme } from '~defs/ProfileData';
import { hx } from '~ui2/views/basis/qx';
import { ClosableOverlay } from '~ui2/views/common/basicModals';
import { css } from 'goober';
import {
  reflectFieldValue,
  reflectFieldChecked
} from '~ui2/views/common/FormHelpers';

interface LayerConfigurationModelEditValues {
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
    width: 80px;
    padding: 0 4px;
    cursor: pointer;
    border: solid 1px #888;
    &[data-current] {
      background: #0f0;
    }
  `;
  return (
    <div css={cssButton} data-current={isCurrent} onClick={setCurrent}>
      {value}
    </div>
  );
};

const defaultSchemeOptions: ILayerDefaultScheme[] = ['block', 'transparent'];

const cssLayerEditDialogPanel = css`
  background: #fff;
  border: solid 1px #ccc;
  width: 400px;
  height: 400px;
  display: flex;
  flex-direction: column;

  .buttons-row {
    flex-grow: 0;
    padding: 5px;
    display: flex;
    justify-content: flex-end;
  }

  button {
    padding: 0 4px;
    border: solid 1px #08f;
  }
`;

const cssDefaultSchemeButtonsRow = css`
  display: flex;
`;

export const callLayerConfigurationModal = createModal(
  (sourceValues: LayerConfigurationModelEditValues) => {
    const edit = sourceValues;

    return (props: {
      close: (result: LayerConfigurationModelEditValues | undefined) => void;
    }) => {
      const onSubmitButton = () => {
        props.close(edit);
      };

      return (
        <ClosableOverlay close={() => props.close(undefined)}>
          <div
            css={cssLayerEditDialogPanel}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <input
                type="text"
                value={edit.layerName}
                onChange={reflectFieldValue(edit, 'layerName')}
              />
            </div>
            <div>
              <span>default scheme</span>
              <div css={cssDefaultSchemeButtonsRow}>
                {defaultSchemeOptions.map((ds) => (
                  <DefaultSchemeButton
                    key={ds}
                    value={ds}
                    isCurrent={edit.defaultScheme === ds}
                    setCurrent={() => (edit.defaultScheme = ds)}
                  />
                ))}
              </div>
            </div>

            <div>
              <span>isShiftLayer:</span>
              <input
                type="checkbox"
                checked={edit.isShiftLayer}
                onChange={reflectFieldChecked(edit, 'isShiftLayer')}
              />
            </div>

            <div className="buttons-row">
              <button onClick={onSubmitButton}>OK</button>
            </div>
          </div>
        </ClosableOverlay>
      );
    };
  }
);
