import { css } from 'goober';
import { h } from '~lib/qx';
import { ViewModelProps } from '~ui/base/helper/mvvmHelpers';
import { IPresetBrowserViewModel } from '~ui/viewModels/PresetBrowserViewModel';
import { GeneralButton } from '~ui/views/controls/GeneralButton';
import { KeyboardBreedSelector3 } from '~ui/views/fabrics/KeyboardBreedSelector3';
import { ProfileSelector3 } from '~ui/views/fabrics/ProfileSelector3';

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
          <KeyboardBreedSelector3
            selectorSource={vm.projectSelectorSource}
            isLinkButtonActive={false}
            linkButtonHandler={() => {}}
          />
        </div>
        <div className="selectorBlock">
          <div>Profile</div>
          <ProfileSelector3 selectorSource={vm.presetSelectorSource} />
        </div>
      </div>
      <GeneralButton text="Edit this" form="large" />
    </div>
  );
};
