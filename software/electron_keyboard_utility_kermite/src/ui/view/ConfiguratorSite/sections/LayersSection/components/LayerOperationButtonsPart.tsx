import { css, jsx } from '@emotion/core';
import {
  FontAwesomeIcon,
  FontAwesomeIconProps
} from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

const LayerOperationButtton = (props: {
  icon: string; //FontAwesomeIconProps['icon'];
  onClick: () => void;
  enabled: boolean;
}) => {
  const cssButton = css`
    font-size: 16px;
    width: 26px;
    height: 26px;
    cursor: pointer;
    &:hover {
      background: #234;
    }
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 4px;

    &[data-enabled='false'] {
      opacity: 0.3;
      pointer-events: none;
    }
  `;
  return (
    <div css={cssButton} onClick={props.onClick} data-enabled={props.enabled}>
      <FontAwesomeIcon icon={props.icon as IconProp} />
    </div>
  );
};

export const LayerOperationButtonsPart = (props: {
  canModifyCurrentLayer: boolean;
  canShiftCurrentLayerBack: boolean;
  canShiftCurrentLayerForward: boolean;
  addNewLayer(): void;
  removeCurrentLayer(): void;
  renameCurrentLayer(): void;
  shiftCurrentLayerBack(): void;
  shiftCurrentLayerForward(): void;
}) => {
  const {
    addNewLayer,
    removeCurrentLayer,
    renameCurrentLayer,
    shiftCurrentLayerBack,
    shiftCurrentLayerForward,
    canModifyCurrentLayer,
    canShiftCurrentLayerBack,
    canShiftCurrentLayerForward
  } = props;

  const cssButtonsRow = css`
    display: flex;
  `;

  return (
    <div css={cssButtonsRow}>
      <LayerOperationButtton icon="plus" onClick={addNewLayer} enabled={true} />
      <LayerOperationButtton
        icon="times"
        onClick={removeCurrentLayer}
        enabled={canModifyCurrentLayer}
      />
      <LayerOperationButtton
        icon="pen-square"
        onClick={renameCurrentLayer}
        enabled={canModifyCurrentLayer}
      />
      <LayerOperationButtton
        icon="long-arrow-alt-up"
        onClick={shiftCurrentLayerBack}
        enabled={canShiftCurrentLayerBack}
      />
      <LayerOperationButtton
        icon="long-arrow-alt-down"
        onClick={shiftCurrentLayerForward}
        enabled={canShiftCurrentLayerForward}
      />
    </div>
  );
};
