import { css } from 'goober';
import { hx } from '~views/basis/qx';

export const SimulatorInputBar = () => {
  const cssSimulatorInputBar = css`
    border: solid 1px #08f;
    height: 40px;
  `;
  return <div css={cssSimulatorInputBar}>simulator input bar</div>;
};
