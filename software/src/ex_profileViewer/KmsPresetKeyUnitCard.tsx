import { jsx, css } from 'alumina';
import { kmsColors } from '~/ex_profileViewer/KmsColors';
import { IDisplayKeyShape } from '~/shared';
import { KeyUnitShape } from '~/ui/elements';

export interface IPresetKeyUnitViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  primaryText: string;
  secondaryText: string;
  isLayerFallback: boolean;
  shape: IDisplayKeyShape;
}

const cssKeyShape = css`
  fill: transparent;
  stroke: ${kmsColors.keyEdge};
  stroke-width: 0.6;
`;

const cssKeyText = css`
  font-size: 5px;
  fill: ${kmsColors.keyText};
  text-anchor: middle;
`;

export const KmsPresetKeyUnitCard = (props: {
  model: IPresetKeyUnitViewModel;
}) => {
  const { keyUnitId, pos, primaryText, secondaryText, isLayerFallback, shape } =
    props.model;

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
      key={keyUnitId}
    >
      <KeyUnitShape shape={shape} css={cssKeyShape} />
      <text css={cssKeyText} x={0} y={-2} if={!isLayerFallback}>
        {primaryText}
      </text>

      <text css={cssKeyText} x={0} y={4} if={!isLayerFallback}>
        {secondaryText}
      </text>
    </g>
  );
};
