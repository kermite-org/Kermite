import { jsx, css } from 'qx';
import { uiTheme } from '~/ui/base';
import { EditMenuBar } from '~/ui/editors/LayoutEditor/views/editMenuBar/EditMenuBar';
import { EditSvgViewContainer } from '~/ui/editors/LayoutEditor/views/editSvgView';
import { EditorSideColumnContent } from '~/ui/editors/LayoutEditor/views/sidePanels';

export const LayoutEditorViewRoot = () => {
  return (
    <div css={style}>
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

const style = css`
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
