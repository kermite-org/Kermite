import { css, FC, jsx } from 'qx';
import {
  KeyboardProfileSelector,
  KeyboardProjectSelector,
  GeneralButton,
} from '~/ui/common';
import { IPresetSelectionSectionViewModel } from '~/ui/preset-browser-page/viewModels/PresetSelectionSectionViewModel';

type Props = {
  viewModel: IPresetSelectionSectionViewModel;
};

const style = css`
  display: flex;
  justify-content: space-between;
  align-items: center;

  > .selectorsPart {
    display: flex;
    > * + * {
      margin-left: 40px;
    }

    > .selectorBlock {
      > * + * {
        margin-top: 2px;
      }
    }
  }
`;

export const PresetSelectionSection: FC<Props> = ({
  viewModel: {
    projectSelectorSource,
    isLinkButtonActive,
    linkButtonHandler,
    presetSelectorSource,
    editPresetButtonHandler,
  },
}) => (
  <div css={style}>
    <div class="selectorsPart">
      <div className="selectorBlock">
        <div>Keyboard</div>
        <KeyboardProjectSelector
          selectorSource={projectSelectorSource}
          isLinkButtonActive={isLinkButtonActive}
          linkButtonHandler={linkButtonHandler}
        />
      </div>
      <div className="selectorBlock">
        <div>Preset</div>
        <KeyboardProfileSelector selectorSource={presetSelectorSource} />
      </div>
    </div>
    <GeneralButton
      text="Create Profile"
      size="large"
      onClick={editPresetButtonHandler}
    />
  </div>
);
