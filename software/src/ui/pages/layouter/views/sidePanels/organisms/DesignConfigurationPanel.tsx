import { jsx, css } from 'qx';
import { ICommonSelectorViewModel } from '~/ui/common/base';
import { RibbonSelector } from '~/ui/common/components';
import {
  ConfigRow,
  ConfigSubContent,
  ConfigSubHeader,
} from '~/ui/pages/layouter/views/sidePanels/atoms';
import { ConfigPanelBox } from '~/ui/pages/layouter/views/sidePanels/atoms/ConfigPanelBox';
import { useDesignConfigurationPanelModel } from '~/ui/pages/layouter/views/sidePanels/models/DesignConfigurationPanel.model';
import { IConfigTextEditModel } from '~/ui/pages/layouter/views/sidePanels/models/slots/ConfigTextEditModel';
import { GeneralConfigTextEditRow } from '~/ui/pages/layouter/views/sidePanels/molecules/GeneralConfigTextEditRow';

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
  vmKeySizeUnitMode: ICommonSelectorViewModel;
  vmKeySizeUnitText: IConfigTextEditModel;
}) => {
  const {
    vmKeySizeUnitMode: vmUnitMode,
    vmKeySizeUnitText: vmUnitText,
  } = props;
  return (
    <div>
      <ConfigSubHeader>key size unit</ConfigSubHeader>
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
          {!vmUnitText.valid && 'invalid size specificaion'}
        </div>
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
    vmKeySizeUnitMode,
    vmKeySizeUnitText,
    vmPlacementAnchorMode,
    vmKeyIdMode,
  } = useDesignConfigurationPanelModel();

  return (
    <ConfigPanelBox
      headerText="configurations"
      canToggleOpen={true}
      initialOpen={false}
    >
      <PlacementUnitEditPart
        vmPlacementUnitMode={vmPlacementUnitMode}
        vmPlacementUnitText={vmPlacementUnitText}
      />
      <PlacementAnchorEditPart vmPlacementAnchorMode={vmPlacementAnchorMode} />
      <SizeUnitEditPart
        vmKeySizeUnitMode={vmKeySizeUnitMode}
        vmKeySizeUnitText={vmKeySizeUnitText}
      />
      <KeyIdModePart vmKeyIdMode={vmKeyIdMode} />
    </ConfigPanelBox>
  );
};
