import { h } from 'qx';
import { reflectChecked } from '~/ui-common';
import {
  ConfigContent,
  ConfigHeader,
  ConfigPanel,
  ConfigSubContent,
  ConfigSubHeader,
  ConfigVStack,
} from '~/ui-layouter/editor/views/SidePanels/atoms';
import { GeneralConfigTextEditRow } from '~/ui-layouter/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { useTransGroupEditPanelModel } from '~/ui-layouter/editor/views/SidePanels/models/TransGroupEditPanel.model';
import { TransGroupListPart } from '~/ui-layouter/editor/views/SidePanels/organisms/TransGroupListPart';

export const TransGroupEditPanel = () => {
  const {
    vmX,
    vmY,
    vmAngle,
    currentGroupId,
    vmMirror,
  } = useTransGroupEditPanelModel();
  return (
    <ConfigPanel>
      <ConfigHeader>transformation groups</ConfigHeader>
      <ConfigContent>
        <div>
          <ConfigSubHeader>group {currentGroupId} properties</ConfigSubHeader>
          <ConfigSubContent>
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
              <GeneralConfigTextEditRow
                {...vmAngle}
                label={'angle'}
                labelWidth={70}
                inputWidth={60}
                unit="deg"
              />
              <div>
                <span style={{ width: '80px', display: 'inline-block' }}>
                  mirror
                </span>
                <input
                  type="checkbox"
                  checked={vmMirror.value}
                  onChange={reflectChecked(vmMirror.setValue)}
                  disabled={vmMirror.disabled}
                />
              </div>
            </ConfigVStack>
          </ConfigSubContent>
        </div>
        <TransGroupListPart />
      </ConfigContent>
    </ConfigPanel>
  );
};
