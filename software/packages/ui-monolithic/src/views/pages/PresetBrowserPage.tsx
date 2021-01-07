import { css } from 'goober';
import { uiTheme } from '~ui/core';
import { makePresetBrowserViewModel } from '~ui/viewModels/PresetBrowserViewModel';
import { PresetKeyboardSection } from '~ui/views/organisms/PresetBrowser/PresetKeyboardSection';
import { PresetSelectionSection } from '~ui/views/organisms/PresetBrowser/PresetSelectionSection';
import { h } from '~qx';

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
