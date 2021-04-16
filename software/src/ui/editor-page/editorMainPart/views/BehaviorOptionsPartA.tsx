import { css, FC, jsx } from 'qx';
import { ISelectorOption, texts } from '~/ui/common';
import { RibbonSelector } from '~/ui/common/components';
import { uiStatusModel } from '~/ui/common/sharedModels/UiStatusModel';

const style = css`
  padding: 10px;

  > .selector {
    margin-top: 5px;
  }
`;

const options: ISelectorOption[] = [
  { label: 'EDIT', value: 'edit' },
  { label: 'LIVE', value: 'live' },
];

export const BehaviorOptionsPartA: FC = () => {
  const value = uiStatusModel.settings.showLayersDynamic ? 'live' : 'edit';

  const setValue = (value: 'edit' | 'live') => {
    uiStatusModel.settings.showLayersDynamic = value === 'live';
  };

  return (
    <div css={style}>
      <p>Layer Display Mode</p>
      <RibbonSelector
        options={options}
        value={value}
        setValue={setValue}
        hint={texts.hint_assigner_configs_showLayersDynamic}
        className="selector"
      />
    </div>
  );
};
