import { uiTheme } from '@kermite/ui';
import { css } from 'goober';
import { h } from 'qx';
import { makePresetBrowserViewModel } from '~/viewModels/PresetBrowserViewModel';
import { PresetKeyboardSection } from '~/views/organisms/PresetBrowser/PresetKeyboardSection';
import { PresetSelectionSection } from '~/views/organisms/PresetBrowser/PresetSelectionSection';

const cssPresetBrowserPage = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};

  height: 100%;
  padding: 20px;
  > * + * {
    margin-top: 10px;
  }
`;

export const PresetBrowserPage = () => {
  const vm = makePresetBrowserViewModel();
  return (
    <div css={cssPresetBrowserPage}>
      <div>Preset Browser</div>
      <PresetSelectionSection vm={vm} />
      <PresetKeyboardSection vm={vm} />
    </div>
  );
};
