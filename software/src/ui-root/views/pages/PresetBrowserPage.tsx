import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { makePresetBrowserViewModel } from '~/ui-root/viewModels/PresetBrowserViewModel';
import { PresetKeyboardSection } from '~/ui-root/views/organisms/PresetBrowser/PresetKeyboardSection';
import { PresetSelectionSection } from '~/ui-root/views/organisms/PresetBrowser/PresetSelectionSection';

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
