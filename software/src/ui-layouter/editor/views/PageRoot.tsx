import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { EditSvgViewContainer } from '~/ui-layouter/editor/views/EditSvgView';
import { EditorSideColumnContent } from '~/ui-layouter/editor/views/SidePanels';
import { EditMenuBar } from '~/ui-layouter/editor/views/ToolBar/EditMenuBar';

const cssPageRoot = css`
  color: ${uiTheme.colors.clMainText};

  height: 100%;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  > .topRow {
    padding: 6px 6px 0;
    /* background: ${uiTheme.colors.clPanelBox}; */
    /* margin-bottom: 5px; */
    flex-shrink: 0;
  }

  > .mainRow {
    padding: 6px;
    flex-grow: 1;
    display: flex;

    > .mainColumn {
      flex-grow: 1;
      display: flex;
      border: solid 1px #777;
      /* background: ${uiTheme.colors.clPanelBox}; */
      /* border: solid 1px ${uiTheme.colors.clPrimary}; */
    }

    > .sideColumn {
      /* background: ${uiTheme.colors.clPanelBox}; */
      margin-left: 6px;
      width: 230px;
      /* サイドパネルの内容の高さが多いときに、編集領域のサイズがこれにつられて
      画面外まで広がっててしまうのを抑止するため、レイアウト上の高さを0にしておく */
      height: 0;
    }
  }
`;

export const PageRoot = () => {
  return (
    <div css={cssPageRoot}>
      <div class="topRow">
        <EditMenuBar />
      </div>
      <div class="mainRow">
        <div class="mainColumn">
          <EditSvgViewContainer />
        </div>
        <div class="sideColumn">
          <EditorSideColumnContent />
        </div>
      </div>
    </div>
  );
};
