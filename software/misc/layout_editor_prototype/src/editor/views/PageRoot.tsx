import { css } from 'goober';
import { ConfigPanel } from '~/editor/views/ConfigPanel';
import { EditMenuBar } from '~/editor/views/EditMenuBar';
import { EditSvgViewContainer } from '~/editor/views/EditSvgView';
import { PropertiesPanel } from '~/editor/views/PropertiesPanel';
import { SightEditPanel } from '~/editor/views/SightEditPanel';
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
          <PropertiesPanel />
          <ConfigPanel />
          <SightEditPanel />
        </div>
      </div>
    </div>
  );
};
