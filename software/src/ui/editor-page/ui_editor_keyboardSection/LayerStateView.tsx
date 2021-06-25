import { css, jsx } from 'qx';
import { IPlayerModel, texts, uiStatusModel } from '~/ui/common';
import { useDeviceStatusModel } from '~/ui/common/sharedModels/DeviceStatusModelHook';

const cssLayerStateView = css`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column-reverse;
  margin: 8px;
`;

const cssLayerCard = css`
  width: 80px;

  &[data-active] {
    margin-left: 10px;
    background: #d0f0ff;
  }
  font-size: 14px;
  color: #68a;
  background: #fff;
  border: solid 1px #8ac;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 2px;
  overflow: hidden;
`;

export const LayerStateView = (props: { playerModel: IPlayerModel }) => {
  const { isConnected } = useDeviceStatusModel();
  const visible = uiStatusModel.settings.showLayersDynamic;

  return (
    <div
      css={cssLayerStateView}
      data-hint={texts.hint_assigner_keyboardView_layerStates}
      qxIf={visible}
    >
      {props.playerModel.layerStackItems.map((la) => {
        return (
          <div
            key={la.layerId}
            css={cssLayerCard}
            data-active={(isConnected && la.isActive) || false}
          >
            {la.layerName}
          </div>
        );
      })}
    </div>
  );
};
