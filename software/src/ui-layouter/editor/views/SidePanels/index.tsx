import { h, css } from 'qx';
import { editReader } from '~/ui-layouter/editor/store';
import { DesignConfigurationPanel } from '~/ui-layouter/editor/views/SidePanels/organisms/DesignConfigurationPanel';
import { KeyEntityEditPanel } from '~/ui-layouter/editor/views/SidePanels/organisms/KeyEntityEditPanel';
import { OutlineEditPanel } from '~/ui-layouter/editor/views/SidePanels/organisms/OutlineEditPanel';
import { TransGroupEditPanel } from '~/ui-layouter/editor/views/SidePanels/organisms/TransGroupEditPanel';

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
