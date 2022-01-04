import { css, FC, jsx } from 'alumina';
import { ISelectorOption, texts } from '~/ui/base';
import { RibbonSelector } from '~/ui/components';
import { profilesReader } from '~/ui/pages/AssignerPage/models';
import { commitUiSettings, uiState } from '~/ui/store';

const options: ISelectorOption[] = [
  { label: 'EDIT', value: 'edit' },
  { label: 'LIVE', value: 'live' },
];

export const LayerDisplayModePart: FC = () => {
  const value = uiState.settings.showLayersDynamic ? 'live' : 'edit';

  const setValue = (value: 'edit' | 'live') => {
    commitUiSettings({ showLayersDynamic: value === 'live' });
  };

  return (
    <div css={style}>
      <p>{texts.assignerDisplaySettingsPart.layerDisplayMode}</p>
      <RibbonSelector
        options={options}
        value={value}
        setValue={setValue}
        hint={texts.assignerDisplaySettingsPartHint.layerDisplayMode}
        class="selector"
        disabled={!profilesReader.isEditProfileAvailable}
      />
    </div>
  );
};

const style = css`
  > .selector {
    margin-top: 5px;
  }
`;
