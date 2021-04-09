import { jsx, css } from 'qx';
import { texts, uiTheme } from '~/ui-common';
import { makePresetBrowserViewModel } from '~/ui-preset-browser-page/viewModels/PresetBrowserViewModel';
import { PresetKeyboardSection } from '~/ui-preset-browser-page/views/PresetKeyboardSection';
import { PresetSelectionSection } from '~/ui-preset-browser-page/views/PresetSelectionSection';

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
      <div>{texts.label_presetBrowser_pageTitle}</div>
      <PresetSelectionSection vm={vm} />
      <PresetKeyboardSection vm={vm} />
    </div>
  );
};
