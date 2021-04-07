import { jsx, css } from 'qx';
import { texts } from '~/ui-common';
import {
  KeyboardProfileSelector,
  KeyboardProjectSelector,
} from '~/ui/common/components';
import { GeneralButton } from '~/ui/common/components/controls/GeneralButton';
import { ViewModelProps } from '~/ui/common/helpers';
import { IPresetBrowserViewModel } from '~/ui/preset-browser-page/viewModels/PresetBrowserViewModel';

const cssPresetSelectionSection = css`
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

export const PresetSelectionSection = ({
  vm,
}: ViewModelProps<IPresetBrowserViewModel>) => {
  return (
    <div css={cssPresetSelectionSection}>
      <div class="selectorsPart">
        <div className="selectorBlock">
          <div>{texts.label_presetBrowser_selectionTitle_keyboard}</div>
          <KeyboardProjectSelector
            selectorSource={vm.projectSelectorSource}
            isLinkButtonActive={vm.isLinkButtonActive}
            linkButtonHandler={vm.linkButtonHandler}
          />
        </div>
        <div className="selectorBlock">
          <div>{texts.label_presetBrowser_selectionTitle_preset}</div>
          <KeyboardProfileSelector
            selectorSource={vm.presetSelectorSource}
            hint={texts.hint_presetBrowser_selection_preset}
          />
        </div>
      </div>
      <GeneralButton
        text={texts.label_presetBrowser_createProfileButton}
        hint={texts.hint_presetBrowser_createProfileButton}
        size="large"
        onClick={vm.editPresetButtonHandler}
      />
    </div>
  );
};
