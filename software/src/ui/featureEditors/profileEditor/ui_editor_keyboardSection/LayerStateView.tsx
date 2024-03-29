import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { IPlayerModel } from '~/ui/commonModels';
import { uiReaders, uiState } from '~/ui/store';

type Props = {
  playerModel: IPlayerModel;
};

export const LayerStateView: FC<Props> = ({ playerModel }) => {
  const { isConnected } = uiReaders.deviceStatus;
  const visible = uiState.settings.showLayersDynamic;
  return (
    <div
      class={cssLayerStateView}
      data-hint={texts.assignerKeyboardViewHint.layerStates}
      if={visible}
    >
      {playerModel.layerStackItems.map((la) => {
        return (
          <div
            key={la.layerId}
            class={cssLayerCard}
            data-active={(isConnected && la.isActive) || false}
          >
            {la.layerName}
          </div>
        );
      })}
    </div>
  );
};

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
