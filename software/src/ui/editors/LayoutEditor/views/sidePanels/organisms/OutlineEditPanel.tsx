import { FC, jsx } from 'qx';
import { HFlex, GeneralSelector } from '~/ui/components';
import { useOutlineEditPanelModel } from '~/ui/editors/LayoutEditor/views/sidePanels/models/OutlineEditPanel.model';
import {
  ConfigSubContent,
  ConfigSubHeader,
  ConfigVStack,
  ConfigPanelBox,
  GeneralConfigTextEditRow,
} from '~/ui/elements';

export const OutlineEditPanel: FC = () => {
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
