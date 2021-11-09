import { css, FC, jsx } from 'qx';
import { colors, ISelectorOption, ISelectorSource } from '~/ui/base';
import { RibbonSelector } from '~/ui/components';
import { PresetBrowserPageContent } from '~/ui/features/PresetBrowser/PresetBrowserPageContent';
import { PresetBrowserPageContent2 } from '~/ui/features/PresetBrowser/PresetBrowserPageContent2';
import { usePersistState2 } from '~/ui/utils';

type IPresetSource = 'central' | 'userProfiles';

export const PresetBrowserPage: FC = () => <PresetBrowserPageContent />;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PresetBrowserPage_SourceSelectable: FC = () => {
  const [sourceValue, setSourceValue] = usePersistState2<IPresetSource>(
    'preset-browser-source',
    'central',
  );
  const sourceOptions: ISelectorOption[] = [
    { value: 'central', label: 'Central' },
    { value: 'userProfiles', label: 'User Profiles' },
  ];
  const sourceSelectorOptions: ISelectorSource = {
    options: sourceOptions,
    value: sourceValue,
    setValue: setSourceValue as any,
  };
  return (
    <div class={style}>
      <div class="top-row">
        <div>Source</div>
        <RibbonSelector {...sourceSelectorOptions} buttonWidth={0} />
      </div>
      <PresetBrowserPageContent qxIf={sourceValue === 'central'} />
      <PresetBrowserPageContent2 qxIf={sourceValue === 'userProfiles'} />
    </div>
  );
};

const style = css`
  height: 100%;
  background: ${colors.clPanelBox};
  padding: 20px;
  > .top-row {
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;
