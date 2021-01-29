import { css } from 'goober';
import { h, Hook } from 'qx';
import { uiTheme } from '~/ui-common';
import { presetBrowserModel } from '~/ui-root/zones/presetBrowser/models/PresetBrowserModel';
import { makePresetBrowserViewModel } from '~/ui-root/zones/presetBrowser/viewModels/PresetBrowserViewModel';
import { PresetKeyboardSection } from '~/ui-root/zones/presetBrowser/views/PresetKeyboardSection';
import { PresetSelectionSection } from '~/ui-root/zones/presetBrowser/views/PresetSelectionSection';

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
  Hook.useEffect(presetBrowserModel.startPageSession, []);

  const vm = makePresetBrowserViewModel();

  return (
    <div css={cssPresetBrowserPage}>
      <div>Preset Browser</div>
      <PresetSelectionSection vm={vm} />
      <PresetKeyboardSection vm={vm} />
    </div>
  );
};
