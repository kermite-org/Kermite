import { jsx } from 'qx';
import { HFlex, CheckBox } from '~/ui/components';
import {
  ConfigSubContent,
  ConfigSubHeader,
  ConfigVStack,
  ConfigPanelBox,
  GeneralConfigTextEditRow,
} from '~/ui/components/layouterParts';
import { useTransGroupEditPanelModel } from '~/ui/pages/layouter/views/sidePanels/models/TransGroupEditPanel.model';
import { TransGroupListPart } from '~/ui/pages/layouter/views/sidePanels/organisms/TransGroupListPart';

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
