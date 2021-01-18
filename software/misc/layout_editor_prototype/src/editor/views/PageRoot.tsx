import { css } from 'goober';
import { EditSvgViewContainer } from '~/editor/views/EditSvgView';
import { EditorSideColumnContent } from '~/editor/views/SidePanels';
import { EditMenuBar } from '~/editor/views/ToolBar/EditMenuBar';
import { h } from '~/qx';

const cssPageRoot = css`
  border: solid 2px #f08;
  padding: 10px;
  height: 100%;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  > .topRow {
    margin: 10px 0;
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
      <div>layout editor proto</div>
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
