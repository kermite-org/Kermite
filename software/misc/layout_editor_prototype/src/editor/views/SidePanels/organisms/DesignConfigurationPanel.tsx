import { css } from 'goober';
import { ExclusiveButtonGroup, ICommonSelectorViewModel } from '~/controls';
import { GeneralConfigTextEditRow } from '~/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { useDesignConfigurationPanelModel } from '~/editor/views/SidePanels/models/DesignConfigurationPanel.model';
import { IConfigTextEditModel } from '~/editor/views/SidePanels/models/slots/ConfigTextEditModel';
import { h } from '~/qx';

const cssUnitEditPart = css`
  > .headerRow {
  }

  > .editRow {
    margin-top: 5px;
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
      <div className="headerRow">key alignment unit</div>
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
      margin-top: 10px;
    }
  `;

  const {
    vmPlacementUnitMode,
    vmPlacementUnitText,
    vmSizeUnitMode,
  } = useDesignConfigurationPanelModel();

  return (
    <div css={cssDesignConfigurationPanel}>
      <PlacementUnitEditPart
        vmPlacementUnitMode={vmPlacementUnitMode}
        vmPlacementUnitText={vmPlacementUnitText}
      />
      <SizeUnitEditPart vmUnitSizeMode={vmSizeUnitMode} />
    </div>
  );
};
