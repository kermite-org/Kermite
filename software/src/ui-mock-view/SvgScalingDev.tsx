import { css, FC, jsx } from 'alumina';

export const SvgScalingDevPage: FC = () => {
  return (
    <div css={rootCss}>
      <div className="cardFrame">
        <svg viewBox="0 0 200 100">
          <rect
            x="0"
            y="0"
            width="200"
            height="100"
            stroke="blue"
            fill="yellow"
            stroke-width="4"
          />
          <circle cx="100" cy="50" r="50" fill="blue" />
        </svg>
      </div>

      <div className="cardFrame">
        <svg viewBox="0 0 100 200">
          <rect
            x="0"
            y="0"
            width="100"
            height="200"
            stroke="blue"
            fill="yellow"
            stroke-width="4"
          />
          <circle cx="50" cy="100" r="50" fill="blue" />
        </svg>
      </div>
    </div>
  );
};

const rootCss = css`
  padding: 10px;

  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  .cardFrame {
    width: 320px;
    height: 240px;
    border: solid 1px red;
    display: flex;
    justify-content: center;
    align-items: center;

    > svg {
      max-width: 100%;
      max-height: 100%;
    }
  }
`;
