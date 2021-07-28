import { jsx } from 'qx';
import { HFlex, GeneralSelector } from '~/ui/common/components';
import {
  ConfigSubContent,
  ConfigSubHeader,
  ConfigVStack,
} from '~/ui/pages/layouter/views/sidePanels/atoms';
import { ConfigPanelBox } from '~/ui/pages/layouter/views/sidePanels/atoms/ConfigPanelBox';
import { useOutlineEditPanelModel } from '~/ui/pages/layouter/views/sidePanels/models/OutlineEditPanel.model';
import { GeneralConfigTextEditRow } from '~/ui/pages/layouter/views/sidePanels/molecules/GeneralConfigTextEditRow';

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
            <GeneralSelector {...vmGroupId} width={80} />
          </HFlex>
        </ConfigSubContent>
      </div>
    </ConfigPanelBox>
  );
};
