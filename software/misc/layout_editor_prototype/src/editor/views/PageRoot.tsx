import { css } from 'goober';
import { appState } from '~/editor/models';
import { ConfigPanel } from '~/editor/views/ConfigPanel';
import { EditMenuBar } from '~/editor/views/EditMenuBar';
import { EditSvgView } from '~/editor/views/EditSvgView';
import { PropertiesPanel } from '~/editor/views/PropertiesPanel';
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
        <EditSvgView />
        <div class="sideColumn">
          <PropertiesPanel />
          <ConfigPanel />
        </div>
      </div>
    </div>
  );
};
