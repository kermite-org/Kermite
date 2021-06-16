import { jsx } from 'qx';
import { CheckBox, HFlex } from '~/ui/common';
import {
  ConfigSubContent,
  ConfigSubHeader,
  ConfigVStack,
} from '~/ui/layouter/views/sidePanels/atoms';
import { ConfigPanelBox } from '~/ui/layouter/views/sidePanels/atoms/ConfigPanelBox';
import { useTransGroupEditPanelModel } from '~/ui/layouter/views/sidePanels/models/TransGroupEditPanel.model';
import { GeneralConfigTextEditRow } from '~/ui/layouter/views/sidePanels/molecules/GeneralConfigTextEditRow';
import { TransGroupListPart } from '~/ui/layouter/views/sidePanels/organisms/TransGroupListPart';

export const TransGroupEditPanel = () => {
  const {
    vmX,
    vmY,
    vmAngle,
    currentGroupId,
    vmMirror,
  } = useTransGroupEditPanelModel();
  return (
    <ConfigPanelBox headerText="transformation groups">
      <div>
        <ConfigSubHeader>group {currentGroupId} properties</ConfigSubHeader>
        <ConfigSubContent>
          <ConfigVStack>
            <GeneralConfigTextEditRow
              {...vmX}
              label={'x'}
              labelWidth={70}
              inputWidth={80}
              unit="mm"
            />
            <GeneralConfigTextEditRow
              {...vmY}
              label={'y'}
              labelWidth={70}
              inputWidth={80}
              unit="mm"
            />
            <GeneralConfigTextEditRow
              {...vmAngle}
              label={'angle'}
              labelWidth={70}
              inputWidth={80}
              unit="deg"
            />
            <HFlex>
              <span style={{ width: '70px' }}>mirror</span>
              <CheckBox
                checked={vmMirror.value}
                setChecked={vmMirror.setValue}
                disabled={vmMirror.disabled}
              />
            </HFlex>
          </ConfigVStack>
        </ConfigSubContent>
      </div>
      <TransGroupListPart />
    </ConfigPanelBox>
  );
};
