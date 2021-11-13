import { css, FC, jsx } from 'alumina';
import { colors } from '~/ui/base';
import { LayoutEditorCore } from '~/ui/featureEditors';
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
  background: ${colors.clBackground};
  /* background: ${colors.clPanelBox}; */
  /* padding: 4px; */

  > .topRow {
    /* background: ${colors.clPanelBox}; */
    /* background: ${colors.clBackground}; */
    flex-shrink: 0;
  }

  > .mainRow {
    flex-grow: 1;
    /* margin-top: 4px; */
    /* margin: 4px; */
  }
`;
