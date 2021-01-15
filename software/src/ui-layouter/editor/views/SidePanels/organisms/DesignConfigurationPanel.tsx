import {
  ExclusiveButtonGroup,
  ICommonSelectorViewModel,
} from '@ui-layouter/controls';
import {
  ConfigContent,
  ConfigHeader,
  ConfigPanel,
  ConfigRow,
  ConfigSubContent,
  ConfigSubHeader,
} from '@ui-layouter/editor/views/SidePanels/atoms';
import { GeneralConfigTextEditRow } from '@ui-layouter/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { useDesignConfigurationPanelModel } from '@ui-layouter/editor/views/SidePanels/models/DesignConfigurationPanel.model';
import { IConfigTextEditModel } from '@ui-layouter/editor/views/SidePanels/models/slots/ConfigTextEditModel';
import { css } from 'goober';
import { h } from 'qx';

const cssErrorText = css`
  color: red;
  font-size: 14px;
`;

const PlacementUnitEditPart = (props: {
  vmPlacementUnitMode: ICommonSelectorViewModel;
  vmPlacementUnitText: IConfigTextEditModel;
}) => {
  const {
    vmPlacementUnitMode: vmUnitMode,
    vmPlacementUnitText: vmUnitText,
  } = props;

  return (
    <div>
      <ConfigSubHeader>key placement unit</ConfigSubHeader>
      <ConfigSubContent>
        <ConfigRow>
          <ExclusiveButtonGroup {...vmUnitMode} buttonWidth={40} />
          <GeneralConfigTextEditRow
            {...vmUnitText}
            label=""
            labelWidth={0}
            inputWidth={85}
            unit="mm"
          />
        </ConfigRow>
        <div css={cssErrorText}>
          {!vmUnitText.valid && 'invalid keypitch specificaion'}
        </div>
      </ConfigSubContent>
    </div>
  );
};

const PlacementAnchorEditPart = (props: {
  vmPlacementAnchorMode: ICommonSelectorViewModel;
}) => {
  const { vmPlacementAnchorMode } = props;
  return (
    <div>
      <ConfigSubHeader>key placement anchor</ConfigSubHeader>
      <ConfigSubContent>
        <ExclusiveButtonGroup {...vmPlacementAnchorMode} buttonWidth={60} />
      </ConfigSubContent>
    </div>
  );
};

const SizeUnitEditPart = (props: {
  vmUnitSizeMode: ICommonSelectorViewModel;
}) => {
  const { vmUnitSizeMode } = props;
  return (
    <div>
      <ConfigSubHeader>key size unit</ConfigSubHeader>
      <ConfigSubContent>
        <ExclusiveButtonGroup {...vmUnitSizeMode} buttonWidth={40} />
      </ConfigSubContent>
    </div>
  );
};

export const DesignConfigurationPanel = () => {
  const {
    vmPlacementUnitMode,
    vmPlacementUnitText,
    vmSizeUnitMode,
    vmPlacementAnchorMode,
  } = useDesignConfigurationPanelModel();

  return (
    <ConfigPanel>
      <ConfigHeader>configurations</ConfigHeader>
      <ConfigContent>
        <PlacementUnitEditPart
          vmPlacementUnitMode={vmPlacementUnitMode}
          vmPlacementUnitText={vmPlacementUnitText}
        />
        <PlacementAnchorEditPart
          vmPlacementAnchorMode={vmPlacementAnchorMode}
        />
        <SizeUnitEditPart vmUnitSizeMode={vmSizeUnitMode} />
      </ConfigContent>
    </ConfigPanel>
  );
};
