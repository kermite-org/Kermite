import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import {
  KeyboardProfileSelector,
  KeyboardProjectSelector,
  GeneralButton,
} from '~/ui/components';
import { IPresetSelectionSectionViewModel } from '~/ui/features/PresetBrowser/viewModels';

type Props = {
  viewModel: IPresetSelectionSectionViewModel;
};

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
        <div>{texts.label_presetBrowser_selectionTitle_keyboard}</div>
        <KeyboardProjectSelector
          selectorSource={projectSelectorSource}
          isLinkButtonActive={isLinkButtonActive}
          linkButtonHandler={linkButtonHandler}
          hint={texts.hint_presetBrowser_selection_keyboard}
        />
      </div>
      <div className="selectorBlock">
        <div>{texts.label_presetBrowser_selectionTitle_preset}</div>
        <KeyboardProfileSelector
          selectorSource={presetSelectorSource}
          hint={texts.hint_presetBrowser_selection_preset}
        />
      </div>
    </div>
    <GeneralButton
      text={texts.label_presetBrowser_createProfileButton}
      hint={texts.hint_presetBrowser_createProfileButton}
      size="large"
      onClick={editPresetButtonHandler}
    />
  </div>
);

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
