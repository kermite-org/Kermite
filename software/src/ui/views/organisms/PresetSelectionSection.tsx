import { css } from 'goober';
import { h } from '~lib/qx';
import { ViewModelProps } from '~ui/base/helper/mvvmHelpers';
import { IPresetBrowserViewModel } from '~ui/viewModels/PresetBrowserViewModel';
import { GeneralButton } from '~ui/views/controls/GeneralButton';
import { KeyboardProfileSelector } from '~ui/views/fabrics/KeyboardProfileSelector';
import { KeyboardProjectSelector } from '~ui/views/fabrics/KeyboardProjectSelector';

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
  vm
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
          <div>Profile</div>
          <KeyboardProfileSelector selectorSource={vm.presetSelectorSource} />
        </div>
      </div>
      <GeneralButton text="Edit this" form="large" />
    </div>
  );
};
