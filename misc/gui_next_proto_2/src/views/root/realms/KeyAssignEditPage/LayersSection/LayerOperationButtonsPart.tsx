import { css } from 'goober';
import { editorModel } from '~models/AppModel';
import { hx } from '~views/basis/qx';

const LayerOperationButtton = (props: {
  icon: string;
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

    &[data-disabled] {
      opacity: 0.3;
      pointer-events: none;
    }
    color: #fff;
  `;
  return (
    <div css={cssButton} onClick={props.onClick} data-disabled={!props.enabled}>
      <i class={props.icon} />
    </div>
  );
};

function makeOperationButtonsViewModel() {
  const la = editorModel.profileModel.currentLayer;

  const canModifyLayer = la.canModify;
  const canShiftBackLayer = la.canShiftBack;
  const canShiftForwardLayer = la.canShiftForward;
  const deleteLayer = la.delete.bind(la);
  const shiftBackLayer = la.shiftBack.bind(la);
  const shiftForwardLayer = la.shiftForward.bind(la);

  const addNewLayer = async () => {
    // const newLayerName = await modalTextInput({
    //   message: 'please input new layer name',
    // });
    // if (newLayerName) {
    // }
  };

  const renameLayer = async () => {
    // const curLayer = editorModel.currentLayer;
    // if (curLayer) {
    //   const newLayerName = await modalTextInput({
    //     message: 'please input new layer name',
    //     defaultText: curLayer.layerName,
    //   });
    //   if (newLayerName) {
    //     curLayer.layerName = newLayerName;
    //   }
    // }
  };

  return {
    canModifyLayer,
    canShiftBackLayer,
    canShiftForwardLayer,
    deleteLayer,
    shiftBackLayer,
    shiftForwardLayer,
    addNewLayer,
    renameLayer,
  };
}

export const LayerOperationButtonsPart = () => {
  const cssButtonsRow = css`
    display: flex;
  `;
  const {
    canModifyLayer,
    canShiftBackLayer,
    canShiftForwardLayer,
    deleteLayer,
    shiftBackLayer,
    shiftForwardLayer,
    addNewLayer,
    renameLayer,
  } = makeOperationButtonsViewModel();
  return (
    <div css={cssButtonsRow}>
      <LayerOperationButtton
        icon="fa fa-plus"
        onClick={addNewLayer}
        enabled={true}
      />
      <LayerOperationButtton
        icon="fa fa-times"
        onClick={deleteLayer}
        enabled={canModifyLayer}
      />
      <LayerOperationButtton
        icon="fa fa-pen-square"
        onClick={renameLayer}
        enabled={canModifyLayer}
      />
      <LayerOperationButtton
        icon="fa fa-long-arrow-alt-up"
        onClick={shiftBackLayer}
        enabled={canShiftBackLayer}
      />
      <LayerOperationButtton
        icon="fa fa-long-arrow-alt-down"
        onClick={shiftForwardLayer}
        enabled={canShiftForwardLayer}
      />
    </div>
  );
};
