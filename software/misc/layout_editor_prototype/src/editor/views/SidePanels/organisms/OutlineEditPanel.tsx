import { css } from 'goober';
import { useClosureModel } from '~/base/hooks';
import { GeneralConfigTextEditRow } from '~/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { createOutlineEditpanelModel } from '~/editor/views/SidePanels/models/OutlineEditPanel.model';
import { h } from '~/qx';

const cssSightEditPanel = css`
  padding: 10px;

  .content {
    padding-left: 10px;
  }
`;

export const OutlineEditPanel = () => {
  const { vmX, vmY } = useClosureModel(createOutlineEditpanelModel);

  return (
    <div css={cssSightEditPanel}>
      <div>point properties</div>
      <div class="content">
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
      </div>
    </div>
  );
};
