import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/common';
import { IPresetBrowserViewModel } from '~/ui/pages/preset-browser-page/viewModels';
import {
  PresetKeyboardSection,
  PresetSelectionSection,
} from '~/ui/pages/preset-browser-page/views';

interface Props {
  pageTitle: string;
  viewModel: IPresetBrowserViewModel;
  customContent?: JSX.Element;
}

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};

  height: 100%;
  padding: 20px;
  > * + * {
    margin-top: 10px;
  }
`;

export const PresetBrowserPageView: FC<Props> = ({
  pageTitle,
  viewModel,
  customContent,
}) => (
  <div css={style}>
    <div>{pageTitle}</div>
    <PresetSelectionSection
      viewModel={viewModel.presetSelectionSectionViewModel}
    />
    <PresetKeyboardSection
      viewModel={viewModel.presetKeyboardSectionViewModel}
    />
    {customContent && <div>{customContent}</div>}
  </div>
);
