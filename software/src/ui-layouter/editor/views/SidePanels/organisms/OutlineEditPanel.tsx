import { GeneralSelector } from '~/ui-layouter/controls';
import {
  ConfigContent,
  ConfigHeader,
  ConfigPanel,
  ConfigSubContent,
  ConfigSubHeader,
  ConfigVStack,
} from '~/ui-layouter/editor/views/SidePanels/atoms';
import { GeneralConfigTextEditRow } from '~/ui-layouter/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { useOutlineEditPanelModel } from '~/ui-layouter/editor/views/SidePanels/models/OutlineEditPanel.model';
import { h } from 'qx';

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
    <ConfigPanel>
      <ConfigHeader>outline shapes</ConfigHeader>
      <ConfigContent>
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
            <div>
              <span style={{ width: '80px', display: 'inline-block' }}>
                group
              </span>
              <GeneralSelector {...vmGroupId} width={60} />
            </div>
          </ConfigSubContent>
        </div>
      </ConfigContent>
    </ConfigPanel>
  );
};
