import { jsx, css } from 'qx';
import { editReader } from '~/ui/layouter/editor/store';
import { DesignConfigurationPanel } from '~/ui/layouter/editor/views/sidePanels/organisms/DesignConfigurationPanel';
import { KeyEntityEditPanel } from '~/ui/layouter/editor/views/sidePanels/organisms/KeyEntityEditPanel';
import { OutlineEditPanel } from '~/ui/layouter/editor/views/sidePanels/organisms/OutlineEditPanel';
import { TransGroupEditPanel } from '~/ui/layouter/editor/views/sidePanels/organisms/TransGroupEditPanel';

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
