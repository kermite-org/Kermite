import { css } from 'goober';
import { useClosureModel } from '~/base/hooks';
import { createOutlineEditpanelModel } from '~/editor/views/SidePanels/OutlineEditPanel.model';
import { GeneralConfigTextEditRow } from '~/editor/views/SidePanels/editRows/GeneralConfigTextEditRow';
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
          model={vmX}
          label={'x'}
          labelWidth={70}
          inputWidth={60}
          unit="mm"
        />
        <GeneralConfigTextEditRow
          model={vmY}
          label={'y'}
          labelWidth={70}
          inputWidth={60}
          unit="mm"
        />
      </div>
    </div>
  );
};
