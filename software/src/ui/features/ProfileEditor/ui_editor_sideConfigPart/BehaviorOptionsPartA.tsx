import { css, FC, jsx } from 'qx';
import { ISelectorOption, texts } from '~/ui/base';
import { commitUiSettings, uiState } from '~/ui/commonStore';
import { RibbonSelector } from '~/ui/components';
import { profilesReader } from '~/ui/pages/assigner-page/models';

const options: ISelectorOption[] = [
  { label: 'EDIT', value: 'edit' },
  { label: 'LIVE', value: 'live' },
];

export const BehaviorOptionsPartA: FC = () => {
  const value = uiState.settings.showLayersDynamic ? 'live' : 'edit';

  const setValue = (value: 'edit' | 'live') => {
    commitUiSettings({ showLayersDynamic: value === 'live' });
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
        disabled={!profilesReader.isEditProfileAvailable}
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
