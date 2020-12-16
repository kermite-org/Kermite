import { css } from 'goober';
import { EditSvgView } from '~/editor/EditSvgView';
import { PropertiesPanel } from '~/editor/PropertiesPanel';
import { h } from '~/qx';

export const PageRoot = () => {
  const cssPageRoot = css`
    border: solid 2px #f08;
    padding: 10px;
    height: 100%;

    > .mainRow {
      display: flex;

      > .sideColumn {
        width: 240px;
        border: solid 1px #888;
      }
    }
  `;

  return (
    <div css={cssPageRoot}>
      <div>layout editor proto</div>
      <div class="mainRow">
        <EditSvgView />
        <div class="sideColumn">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
};
