import { FC, jsx } from 'alumina';
import { HFlex, CheckBox } from '~/ui/components';
import {
  ConfigSubContent,
  ConfigSubHeader,
  ConfigVStack,
  ConfigPanelBox,
  GeneralConfigTextEditRow,
} from '~/ui/elements';
import { useTransGroupEditPanelModel } from '~/ui/featureEditors/layoutEditor/views/sidePanels/models/transGroupEditPanel.model';
import { TransGroupListPart } from '~/ui/featureEditors/layoutEditor/views/sidePanels/organisms/TransGroupListPart';

export const TransGroupEditPanel: FC = () => {
  const { vmX, vmY, vmAngle, currentGroupId, vmMirror } =
    useTransGroupEditPanelModel();
  return (
    <ConfigPanelBox headerText="transformation groups">
      <div>
        <ConfigSubHeader>group {currentGroupId} properties</ConfigSubHeader>
        <ConfigSubContent>
          <ConfigVStack>
            <GeneralConfigTextEditRow
              {...vmX}
              label="x"
              labelWidth={70}
              inputWidth={80}
              unit="mm"
            />
            <GeneralConfigTextEditRow
              {...vmY}
              label="y"
              labelWidth={70}
              inputWidth={80}
              unit="mm"
            />
            <GeneralConfigTextEditRow
              {...vmAngle}
              label="angle"
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
