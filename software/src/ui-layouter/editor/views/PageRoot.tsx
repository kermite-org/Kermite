import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { EditSvgViewContainer } from '~/ui-layouter/editor/views/EditSvgView';
import { EditorSideColumnContent } from '~/ui-layouter/editor/views/SidePanels';
import { EditMenuBar } from '~/ui-layouter/editor/views/ToolBar/EditMenuBar';

const cssPageRoot = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};

  padding: 6px;
  height: 100%;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  > .topRow {
    margin-bottom: 5px;
    flex-shrink: 0;
  }

  > .mainRow {
    flex-grow: 1;
    display: flex;

    > .sideColumn {
      width: 240px;
      border: solid 1px #888;
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
        <EditSvgViewContainer />
        <div class="sideColumn">
          <EditorSideColumnContent />
        </div>
      </div>
    </div>
  );
};
