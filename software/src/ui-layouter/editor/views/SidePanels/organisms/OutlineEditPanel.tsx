import { h } from 'qx';
import { GeneralSelector, HFlex } from '~/ui-common/components';
import {
  ConfigSubContent,
  ConfigSubHeader,
  ConfigVStack,
} from '~/ui-layouter/editor/views/SidePanels/atoms';
import { ConfigPanelBox } from '~/ui-layouter/editor/views/SidePanels/atoms/ConfigPanelBox';
import { GeneralConfigTextEditRow } from '~/ui-layouter/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { useOutlineEditPanelModel } from '~/ui-layouter/editor/views/SidePanels/models/OutlineEditPanel.model';

export const OutlineEditPanel = () => {
  const {
    vmX,
    vmY,
    currentShapeId,
    currentPointIndex,
    numShapePoints,
    vmGroupId,
  } = useOutlineEditPanelModel();

  const pointIndexText = currentPointIndex !== -1 ? currentPointIndex : '';

  return (
    <ConfigPanelBox headerText="outline shapes">
      <div>
        <ConfigSubHeader>point {pointIndexText} properties</ConfigSubHeader>
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
          </ConfigVStack>
        </ConfigSubContent>
      </div>
      <div>
        <ConfigSubHeader>shape properties</ConfigSubHeader>
        <ConfigSubContent>
          <div>shapeID: {currentShapeId}</div>
          <div>numPoints: {numShapePoints}</div>
          <HFlex>
            <span style={{ width: '70px' }}>group</span>
            <GeneralSelector {...vmGroupId} width={60} />
          </HFlex>
        </ConfigSubContent>
      </div>
    </ConfigPanelBox>
  );
};
