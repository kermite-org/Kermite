import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { LayoutEditorCore } from '~/ui/editors';
import { LayoutManagerTopBarTemplate } from '~/ui/pages/layout-editor-page/templates/LayoutManagerTopBarTemplate';

export const LayoutManagerPageComponent: FC = () => {
  return (
    <div css={style}>
      <div className="topRow">
        <LayoutManagerTopBarTemplate />
      </div>
      <div className="mainRow">
        <LayoutEditorCore.Component />
      </div>
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${uiTheme.colors.clBackground};
  /* background: ${uiTheme.colors.clPanelBox}; */
  /* padding: 4px; */

  > .topRow {
    /* background: ${uiTheme.colors.clPanelBox}; */
    /* background: ${uiTheme.colors.clBackground}; */
    flex-shrink: 0;
  }

  > .mainRow {
    flex-grow: 1;
    /* margin-top: 4px; */
    /* margin: 4px; */
  }
`;
