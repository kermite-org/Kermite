import { css, FC, jsx } from 'qx';
import { ISelectorOption, texts } from '~/ui/base';
import { uiStatusModel } from '~/ui/commonModels';
import { RibbonSelector } from '~/ui/components';
import { profilesModel } from '~/ui/pages/editor-page/models/ProfilesModel';

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
        disabled={!profilesModel.isEditProfileAvailable}
      />
    </div>
  );
};

const style = css`
  padding: 10px;

  > .selector {
    margin-top: 5px;
  }
`;
