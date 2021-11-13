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
      <div className="selectorBlock" qxIf={cansSelectProject}>
        <div>{texts.label_presetBrowser_selectionTitle_keyboard}</div>
        <KeyboardProjectSelector
          selectorSource={projectSelectorSource}
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
