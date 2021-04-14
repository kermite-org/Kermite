import { jsx, css } from 'qx';
import { editReader } from '~/ui/layouter/editor/store';
import { DesignConfigurationPanel } from '~/ui/layouter/editor/views/sidePanels_/organisms/DesignConfigurationPanel';
import { KeyEntityEditPanel } from '~/ui/layouter/editor/views/sidePanels_/organisms/KeyEntityEditPanel';
import { OutlineEditPanel } from '~/ui/layouter/editor/views/sidePanels_/organisms/OutlineEditPanel';
import { TransGroupEditPanel } from '~/ui/layouter/editor/views/sidePanels_/organisms/TransGroupEditPanel';

const cssEditorSideColumnContent = css`
  > :not(:first-child) {
    margin-top: 5px;
  }
`;

export const EditorSideColumnContent = () => {
  const { editorTarget } = editReader;
  return (
    <div css={cssEditorSideColumnContent}>
      <DesignConfigurationPanel />
      {editorTarget === 'key' && <KeyEntityEditPanel />}
      {editorTarget === 'outline' && <OutlineEditPanel />}
      <TransGroupEditPanel />
    </div>
  );
};
