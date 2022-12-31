import { FC, css, jsx } from 'alumina';
import { texts } from '~/app-shared';
import { SectionHeaderText } from '~/fe-shared';
import { BehaviorOptionsPartB, LayerDisplayModePart } from '../blocks';

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
