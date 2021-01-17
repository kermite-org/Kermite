import { h } from 'qx';
import { editReader } from '~/ui-layouter/editor/store';
import { DesignConfigurationPanel } from '~/ui-layouter/editor/views/SidePanels/organisms/DesignConfigurationPanel';
import { KeyEntityEditPanel } from '~/ui-layouter/editor/views/SidePanels/organisms/KeyEntityEditPanel';
import { OutlineEditPanel } from '~/ui-layouter/editor/views/SidePanels/organisms/OutlineEditPanel';
import { TransGroupEditPanel } from '~/ui-layouter/editor/views/SidePanels/organisms/TransGroupEditPanel';

function getPanelContentComponent() {
  const { editorTarget } = editReader;
  // if (editReader.showConfig) {
  //   return ConfigPanel;
  // }
  return {
    key: KeyEntityEditPanel,
    outline: OutlineEditPanel,
  }[editorTarget];
}

export const EditorSideColumnContent = () => {
  const PanelContent = getPanelContentComponent();
  return (
    <div>
      {editReader.showConfig && <DesignConfigurationPanel />}
      {PanelContent && <PanelContent />}
      <TransGroupEditPanel />
    </div>
  );
};
