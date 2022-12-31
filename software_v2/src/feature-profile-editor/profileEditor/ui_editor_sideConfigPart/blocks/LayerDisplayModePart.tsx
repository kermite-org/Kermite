import { css, FC, jsx } from 'alumina';
import { ISelectorOption, texts } from '~/app-shared';
import { RibbonSelector } from '~/fe-shared';
import { profileEditorConfig } from '../../adapters';
// import { profilesReader } from '~/ui/pages/assignerPage/models';
// import { commitUiSettings, uiState } from '~/ui/store';

const options: ISelectorOption[] = [
  { label: 'EDIT', value: 'edit' },
  { label: 'LIVE', value: 'live' },
];

export const LayerDisplayModePart: FC = () => {
  const { settings, commitUiSettings, isEditProfileAvailable } =
    profileEditorConfig;
  const value = settings.showLayersDynamic ? 'live' : 'edit';

  const setValue = (value: 'edit' | 'live') => {
    commitUiSettings({ showLayersDynamic: value === 'live' });
  };

  return (
    <div class={style}>
      <p>{texts.assignerDisplaySettingsPart.layerDisplayMode}</p>
      <RibbonSelector
        options={options}
        value={value}
        setValue={setValue}
        hint={texts.assignerDisplaySettingsPartHint.layerDisplayMode}
        class="selector"
        disabled={!isEditProfileAvailable}
      />
    </div>
  );
};

const style = css`
  > .selector {
    margin-top: 5px;
  }
`;
