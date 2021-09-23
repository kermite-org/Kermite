import { css, FC, jsx } from 'qx';
import { ipcAgent, texts } from '~/ui/base';
import { CommonPageFrame } from '~/ui/components';
import { usePresetBrowserViewModel } from '~/ui/pages/preset-browser-page/viewModels';
import {
  PresetSelectionSection,
  PresetKeyboardSection,
} from '~/ui/pages/preset-browser-page/views';
import { usePresetSelectionModel2 } from '~/ui/pages/preset-browser-page2/models/PresetSelectionModel2';

const CustomContent: FC = () => {
  const style = css`
    margin-top: 10px;
    display: flex;
    justify-content: center;
    .link {
      color: blue;
      cursor: pointer;
    }
  `;
  const onClick = () => {
    ipcAgent.async.platform_openUrlInDefaultBrowser(
      'https://dev.server.kermite.org/',
    );
  };
  return (
    <div css={style}>
      Profiles served on &nbsp;
      <span className="link" onClick={onClick}>
        KermiteServer
      </span>
    </div>
  );
};

export const PresetBrowserPage2: FC = () => {
  const model = usePresetSelectionModel2();
  const viewModel = usePresetBrowserViewModel(model);
  return (
    <CommonPageFrame pageTitle={texts.label_presetBrowser2_pageTitle}>
      <div css={style}>
        <PresetSelectionSection
          viewModel={viewModel.presetSelectionSectionViewModel}
        />
        <PresetKeyboardSection
          viewModel={viewModel.presetKeyboardSectionViewModel}
        />
        <CustomContent />
      </div>
    </CommonPageFrame>
  );
};

const style = css`
  > * + * {
    margin-top: 10px;
  }
`;
