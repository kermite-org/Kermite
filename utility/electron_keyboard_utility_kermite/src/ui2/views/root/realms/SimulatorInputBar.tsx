import { css } from 'goober';
import { hx } from '~ui2/views/basis/qx';
import { logicSimulatorModel } from '~ui2/models/LogicSimulatorModel';

const InputResultTextBox = () => {
  const cssDiv = css`
    border: solid 1px #888;
    width: 300px;
    height: 30px;
    overflow: hidden;
    line-height: 30px;
    color: #fff;
    padding-left: 4px;
  `;
  const { inputResultText } = logicSimulatorModel;
  return <div css={cssDiv}>{inputResultText} </div>;
};

const ClearButton = () => {
  const cssClearButton = css`
    border-radius: 50%;
    width: 30px;
    height: 30px;
    background: #888;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    user-select: none;
    color: #fff;
  `;

  const { clearInputResultText } = logicSimulatorModel;
  return (
    <div css={cssClearButton} onClick={clearInputResultText}>
      <i className="fa fa-times" />
    </div>
  );
};

export const SimulatorInputBar = () => {
  const cssSimulatorInputBar = css`
    flex-shrink: 0;
    border: solid 1px #08f;
    padding: 4px;
    background: #222;

    display: flex;
    > * + * {
      margin-left: 4px;
    }
  `;
  return (
    <div css={cssSimulatorInputBar}>
      <InputResultTextBox />
      <ClearButton />
    </div>
  );
};
