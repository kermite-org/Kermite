import { css } from 'goober';
import { h, rerender } from 'qx';
import { ipcAgent } from '~/ui-common';
import { UiLayouterCore } from '~/ui-layouter';

const cssBase = css`
  height: 100%;
  display: flex;
  flex-direction: column;

  > .topRow {
    flex-shrink: 0;
    display: flex;
    background: #fff;
    padding: 5px;

    > * + * {
      margin-left: 5px;
    }
    > button {
      width: 80px;
      height: 28px;
      cursor: pointer;
    }
  }

  > .mainRow {
    flex-grow: 1;
  }
`;
export const UiLayouterPageComponent = () => {
  const onLoadButton = async () => {
    const data = await ipcAgent.async.file_loadObjectFromJsonWithFileDialog();
    if (data) {
      UiLayouterCore.loadEditDesign(data as any);
      rerender();
    }
  };
  const onSaveButton = async () => {
    const data = UiLayouterCore.emitEditDesign();
    const done = await ipcAgent.async.file_saveObjectToJsonWithFileDialog(data);
    if (done) {
      console.log('file saved');
    }
  };
  return (
    <div css={cssBase}>
      <div className="topRow">
        <button onClick={onLoadButton}>load</button>
        <button onClick={onSaveButton}>save</button>
      </div>
      <div className="mainRow">
        <UiLayouterCore.Component />
      </div>
    </div>
  );
};
