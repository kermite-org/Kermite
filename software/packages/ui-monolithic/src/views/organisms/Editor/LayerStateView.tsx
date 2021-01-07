import { css } from 'goober';
import { models } from '~ui/models';
import { h } from '~qx';

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

export const LayerStateView = () => {
  const { isConnected } = models.deviceStatusModel;

  return (
    <div css={cssLayerStateView}>
      {models.playerModel.layerStackViewSource.map((la) => {
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
