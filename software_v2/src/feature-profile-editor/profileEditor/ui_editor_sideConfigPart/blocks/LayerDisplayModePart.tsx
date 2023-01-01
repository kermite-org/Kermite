import { css, FC, jsx } from 'alumina';
import { ISelectorOption, texts } from '~/app-shared';
import { RibbonSelector } from '~/fe-shared';
import { profileEditorStore } from '../../../store';

const options: ISelectorOption[] = [
  { label: 'EDIT', value: 'edit' },
  { label: 'LIVE', value: 'live' },
];

export const LayerDisplayModePart: FC = () => {
  const { showLayersDynamic } = profileEditorStore.readers;
  const { commitUiSetting } = profileEditorStore.actions;

  const value = showLayersDynamic ? 'live' : 'edit';

  const setValue = (value: 'edit' | 'live') => {
    commitUiSetting({ showLayersDynamic: value === 'live' });
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
      />
    </div>
  );
};

const style = css`
  > .selector {
    margin-top: 5px;
  }
`;
