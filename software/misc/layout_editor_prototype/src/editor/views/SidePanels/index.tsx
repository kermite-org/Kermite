import { editReader } from '~/editor/store';
import { DesignConfigurationPanel } from '~/editor/views/SidePanels/organisms/DesignConfigurationPanel';
import { KeyEntityEditPanel } from '~/editor/views/SidePanels/organisms/KeyEntityEditPanel';
import { OutlineEditPanel } from '~/editor/views/SidePanels/organisms/OutlineEditPanel';
import { h } from '~/qx';

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
    </div>
  );
};
