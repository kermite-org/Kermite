import { css } from 'goober';
import { h } from 'qx';
import {
  KeyboardProfileSelector,
  KeyboardProjectSelector,
} from '~/ui-common/components';
import { GeneralButton } from '~/ui-common/components/controls/GeneralButton';
import { ViewModelProps } from '~/ui-common/helpers';
import { IPresetBrowserViewModel } from '~/ui-preset-browser-page/viewModels/PresetBrowserViewModel';

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
          <div>Keyboard</div>
          <KeyboardProjectSelector
            selectorSource={vm.projectSelectorSource}
            isLinkButtonActive={vm.isLinkButtonActive}
            linkButtonHandler={vm.linkButtonHandler}
          />
        </div>
        <div className="selectorBlock">
          <div>Preset</div>
          <KeyboardProfileSelector selectorSource={vm.presetSelectorSource} />
        </div>
      </div>
      <GeneralButton
        text="Create Profile"
        form="large"
        handler={vm.editPresetButtonHandler}
      />
    </div>
  );
};
