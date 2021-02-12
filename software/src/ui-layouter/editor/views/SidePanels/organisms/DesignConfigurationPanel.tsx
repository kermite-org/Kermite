import { css } from 'goober';
import { h } from 'qx';
import { ICommonSelectorViewModel } from '~/ui-common';
import { RibbonSelector } from '~/ui-common/components';
import {
  ConfigRow,
  ConfigSubContent,
  ConfigSubHeader,
} from '~/ui-layouter/editor/views/SidePanels/atoms';
import { ConfigPanelBox } from '~/ui-layouter/editor/views/SidePanels/atoms/ConfigPanelBox';
import { GeneralConfigTextEditRow } from '~/ui-layouter/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { useDesignConfigurationPanelModel } from '~/ui-layouter/editor/views/SidePanels/models/DesignConfigurationPanel.model';
import { IConfigTextEditModel } from '~/ui-layouter/editor/views/SidePanels/models/slots/ConfigTextEditModel';

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
          <RibbonSelector {...vmUnitMode} buttonWidth={40} />
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
        <RibbonSelector {...vmPlacementAnchorMode} buttonWidth={60} />
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
        <RibbonSelector {...vmUnitSizeMode} buttonWidth={40} />
      </ConfigSubContent>
    </div>
  );
};

const KeyIdModePart = (props: { vmKeyIdMode: ICommonSelectorViewModel }) => {
  const { vmKeyIdMode } = props;
  return (
    <div>
      <ConfigSubHeader>key id mode</ConfigSubHeader>
      <ConfigSubContent>
        <RibbonSelector {...vmKeyIdMode} buttonWidth={60} />
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
    vmKeyIdMode,
  } = useDesignConfigurationPanelModel();

  return (
    <ConfigPanelBox headerText="configurations">
      <PlacementUnitEditPart
        vmPlacementUnitMode={vmPlacementUnitMode}
        vmPlacementUnitText={vmPlacementUnitText}
      />
      <PlacementAnchorEditPart vmPlacementAnchorMode={vmPlacementAnchorMode} />
      <SizeUnitEditPart vmUnitSizeMode={vmSizeUnitMode} />
      <KeyIdModePart vmKeyIdMode={vmKeyIdMode} />
    </ConfigPanelBox>
  );
};
