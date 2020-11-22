import { css } from 'goober';
import { h } from '~lib/qx';
import { makePresetBrowserViewModel } from '~ui/viewModels/PresetBrowserViewModel';
import { PresetKeyboardSection } from '~ui/views/organisms/PresetBrowser/PresetKeyboardSection';
import { PresetSelectionSection } from '~ui/views/organisms/PresetBrowser/PresetSelectionSection';

const cssPresetBrowserPage = css`
  background: #fff;
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