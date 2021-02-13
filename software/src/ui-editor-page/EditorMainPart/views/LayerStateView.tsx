import { jsx, css } from 'qx';
import { texts } from '~/ui-common';
import { useDeviceStatusModel } from '~/ui-common/sharedModels/DeviceStatusModelHook';
import { PlayerModel } from '~/ui-common/sharedModels/PlayerModel';

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

export const LayerStateView = (props: { playerModel: PlayerModel }) => {
  const { isConnected } = useDeviceStatusModel();

  return (
    <div css={cssLayerStateView} data-hint={texts.hintLayerStates}>
      {props.playerModel.layerStackViewSource.map((la) => {
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
