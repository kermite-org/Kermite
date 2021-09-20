import { css, FC, jsx } from 'qx';
import { CommonPageFrame } from '~/ui/components';
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

export const PresetBrowserPageView: FC<Props> = ({
  pageTitle,
  viewModel,
  customContent,
}) => (
  <CommonPageFrame pageTitle={pageTitle}>
    <div css={style}>
      <PresetSelectionSection
        viewModel={viewModel.presetSelectionSectionViewModel}
      />
      <PresetKeyboardSection
        viewModel={viewModel.presetKeyboardSectionViewModel}
      />
      {customContent && <div>{customContent}</div>}
    </div>
  </CommonPageFrame>
);

const style = css`
  > * + * {
    margin-top: 10px;
  }
`;
