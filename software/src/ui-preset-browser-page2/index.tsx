import { jsx, css } from 'qx';
import { texts, uiTheme } from '~/ui-common';
import { PresetKeyboardSection } from '~/ui-preset-browser-page/views/PresetKeyboardSection';
import { PresetSelectionSection } from '~/ui-preset-browser-page/views/PresetSelectionSection';
import { makePresetBrowserViewModel2 } from '~/ui-preset-browser-page2/viewModels/PresetBrowserViewModel2';

const cssPresetBrowserPage = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};

  height: 100%;
  padding: 20px;
  > * + * {
    margin-top: 10px;
  }
`;

export const PresetBrowserPage2 = () => {
  const vm = makePresetBrowserViewModel2();
  return (
    <div css={cssPresetBrowserPage}>
      <div>{texts.label_presetBrowser2_pageTitle}</div>
      <PresetSelectionSection vm={vm} />
      <PresetKeyboardSection vm={vm} />
    </div>
  );
};
