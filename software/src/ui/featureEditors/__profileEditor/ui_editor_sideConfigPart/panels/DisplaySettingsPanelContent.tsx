import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { SectionHeaderText } from '~/ui/elements';
import { BehaviorOptionsPartB } from '~/ui/featureEditors/ProfileEditor/ui_editor_sideConfigPart/blocks/BehaviorOptionsPartB';
import { LayerDisplayModePart } from '~/ui/featureEditors/ProfileEditor/ui_editor_sideConfigPart/blocks/LayerDisplayModePart';

export const DisplaySettingsPanelContent: FC = () => {
  return (
    <div class={style}>
      <SectionHeaderText
        text={texts.assignerDisplaySettingsPart.sectionHeader}
        icon="visibility"
        xOffset={-2}
        hint={texts.assignerDisplaySettingsPartHint.sectionHeader}
      />
      <div class="body">
        <LayerDisplayModePart class="layer-display-mode-part" />
        <BehaviorOptionsPartB />
      </div>
    </div>
  );
};

const style = css`
  > .body {
    margin-top: 5px;

    > * + * {
      margin-top: 10px;
    }
  }
`;
