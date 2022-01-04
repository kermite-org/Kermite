import { css, FC, jsx } from 'alumina';
import { ISelectorSource, texts } from '~/ui/base';
import {
  GeneralButton,
  KeyboardProfileSelector,
  KeyboardProjectSelector,
} from '~/ui/components';

type Props = {
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;
  handleCreateProfileButton: () => void;
  cansSelectProject: boolean;
};

export const PresetSelectionSection: FC<Props> = ({
  projectSelectorSource,
  presetSelectorSource,
  handleCreateProfileButton,
  cansSelectProject,
}) => (
  <div css={style}>
    <div class="selectorsPart">
      <div class="selectorBlock" if={cansSelectProject}>
        <div>{texts.presetBrowser.selectionTitle_keyboard}</div>
        <KeyboardProjectSelector
          selectorSource={projectSelectorSource}
          hint={texts.presetBrowserHint.selection_keyboard}
        />
      </div>
      <div class="selectorBlock">
        <div>{texts.presetBrowser.selectionTitle_preset}</div>
        <KeyboardProfileSelector
          selectorSource={presetSelectorSource}
          hint={texts.presetBrowserHint.selection_preset}
        />
      </div>
    </div>
    <GeneralButton
      text={texts.presetBrowser.createProfileButton}
      hint={texts.presetBrowserHint.createProfileButton}
      size="large"
      onClick={handleCreateProfileButton}
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
