import { css } from 'goober';
import { IDisplayArea } from '~/editor/models';
import { GeneralConfigTextEditRow } from '~/editor/views/GeneralConfigTextEditRow';
import { useDisplayAreaValueTextEditViewModel } from '~/editor/views/SightEditPanel.model';
import { h } from '~/qx';

const displayAreaKeys: (keyof IDisplayArea)[] = [
  'top',
  'left',
  'bottom',
  'right',
];

const cssSightEditPanel = css`
  padding: 10px;

  .content {
    padding-left: 10px;
  }
`;

export const SightEditPanel = () => {
  const models = displayAreaKeys.map(useDisplayAreaValueTextEditViewModel);

  return (
    <div css={cssSightEditPanel}>
      <div>dispaly area</div>
      <div class="content">
        {models.map((model, index) => {
          const propKey = displayAreaKeys[index];
          return (
            <GeneralConfigTextEditRow
              key={propKey}
              model={model}
              label={propKey}
              labelWidth={70}
              inputWidth={60}
              unit="mm"
            />
          );
        })}
      </div>
    </div>
  );
};
