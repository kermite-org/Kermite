import { css, FC, jsx } from 'qx';

type Props = {
  className?: string;
  step: number;
  isActive: boolean;
  clickHandler?: () => void;
};

export const NavigationStepListStepCard: FC<Props> = ({
  className,
  step,
  isActive,
  clickHandler,
}) => (
  <svg
    css={style}
    classNames={[className, isActive && '--active']}
    viewBox="0 0 51 30"
    onClick={clickHandler}
  >
    <polygon points="0,0 40,0, 50,15 40,30, 0,30 10,15" className="shape" />
    <text x={25} y={14} className="text">
      {step}
    </text>
  </svg>
);

const style = css`
  width: 50px;
  height: 30px;
  cursor: pointer;

  & + & {
    margin-left: -5px;
  }

  > .shape {
    fill: #def;
    stroke: #47a;
  }

  &:hover > .shape {
    fill: #bdf;
  }

  &.--active > .shape {
    fill: #adf;
  }

  > .text {
    fill: #47a;
    text-anchor: middle;
    dominant-baseline: central;
  }
`;
