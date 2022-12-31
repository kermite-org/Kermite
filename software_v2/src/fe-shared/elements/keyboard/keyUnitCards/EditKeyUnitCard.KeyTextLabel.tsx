import { css, FC, jsx } from 'alumina';
import { colors } from '~/app-shared';

type Props = {
  text: string;
  xpos: number;
  ypos: number;
  isWeak?: boolean;
  isBold?: boolean;
};

const getFontSize = (text: string) => {
  if (text.length === 1) {
    return '8px';
  } else {
    return '5px';
  }
};

export const KeyTextLabel: FC<Props> = ({
  text,
  xpos,
  ypos,
  isWeak,
  isBold,
}) => (
  <text
    class={style}
    x={xpos}
    y={ypos}
    font-size={getFontSize(text)}
    font-weight={isBold ? 'bold' : 'normal'}
    data-is-weak={isWeak}
    text-anchor="middle"
    dominant-baseline="center"
  >
    {text}
  </text>
);

const style = css`
  fill: ${colors.clKeyUnitLegend};

  &[data-is-weak] {
    fill: ${colors.clKeyUnitLegendWeak};
  }

  pointer-events: none;
`;
