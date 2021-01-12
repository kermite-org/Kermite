import { css } from 'goober';
import { h } from 'qx';
import {
  ExclusiveButtonGroup,
  ICommonSelectorViewModel,
} from '@ui-layouter/controls';
import { GeneralConfigTextEditRow } from '@ui-layouter/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { useDesignConfigurationPanelModel } from '@ui-layouter/editor/views/SidePanels/models/DesignConfigurationPanel.model';
import { IConfigTextEditModel } from '@ui-layouter/editor/views/SidePanels/models/slots/ConfigTextEditModel';

const cssUnitEditPart = css`
  > .headerRow {
  }

  > .editRow {
    margin-top: 4px;
    margin-left: 5px;
    display: flex;
    align-items: center;

    > * + * {
      margin-left: 4px;
    }
  }
  > .errorRow {
    color: red;
    font-size: 14px;
  }
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
    <div css={cssUnitEditPart}>
      <div className="headerRow">key placement unit</div>
      <div className="editRow">
        <ExclusiveButtonGroup {...vmUnitMode} buttonWidth={40} />
        <GeneralConfigTextEditRow
          {...vmUnitText}
          label=""
          labelWidth={0}
          inputWidth={90}
          unit="mm"
        />
      </div>
      <div className="errorRow">
        {!vmUnitText.valid && 'invalid keypitch specificaion'}
      </div>
    </div>
  );
};

const PlacementAnchorEditPart = (props: {
  vmPlacementAnchorMode: ICommonSelectorViewModel;
}) => {
  const { vmPlacementAnchorMode } = props;
  return (
    <div css={cssUnitEditPart}>
      <div className="headerRow">key placement anchor</div>
      <div className="editRow">
        <ExclusiveButtonGroup {...vmPlacementAnchorMode} buttonWidth={60} />
      </div>
    </div>
  );
};

const SizeUnitEditPart = (props: {
  vmUnitSizeMode: ICommonSelectorViewModel;
}) => {
  const { vmUnitSizeMode } = props;
  return (
    <div css={cssUnitEditPart}>
      <div className="headerRow">key size unit</div>
      <div className="editRow">
        <ExclusiveButtonGroup {...vmUnitSizeMode} buttonWidth={40} />
      </div>
    </div>
  );
};

export const DesignConfigurationPanel = () => {
  const cssDesignConfigurationPanel = css`
    padding: 10px;
    > * + * {
      margin-top: 5px;
    }
  `;

  const {
    vmPlacementUnitMode,
    vmPlacementUnitText,
    vmSizeUnitMode,
    vmPlacementAnchorMode,
  } = useDesignConfigurationPanelModel();

  return (
    <div css={cssDesignConfigurationPanel}>
      <PlacementUnitEditPart
        vmPlacementUnitMode={vmPlacementUnitMode}
        vmPlacementUnitText={vmPlacementUnitText}
      />
      <PlacementAnchorEditPart vmPlacementAnchorMode={vmPlacementAnchorMode} />
      <SizeUnitEditPart vmUnitSizeMode={vmSizeUnitMode} />
    </div>
  );
};
