import {
  ConfigContent,
  ConfigHeader,
  ConfigPanel,
  ConfigVStack,
} from '@ui-layouter/editor/views/SidePanels/atoms';
import { GeneralConfigTextEditRow } from '@ui-layouter/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { useOutlineEditPanelModel } from '@ui-layouter/editor/views/SidePanels/models/OutlineEditPanel.model';
import { h } from 'qx';

export const OutlineEditPanel = () => {
  const { vmX, vmY } = useOutlineEditPanelModel();

  return (
    <ConfigPanel>
      <ConfigHeader>point properties</ConfigHeader>
      <ConfigContent>
        <ConfigVStack>
          <GeneralConfigTextEditRow
            {...vmX}
            label={'x'}
            labelWidth={70}
            inputWidth={60}
            unit="mm"
          />
          <GeneralConfigTextEditRow
            {...vmY}
            label={'y'}
            labelWidth={70}
            inputWidth={60}
            unit="mm"
          />
        </ConfigVStack>
      </ConfigContent>
    </ConfigPanel>
  );
};
