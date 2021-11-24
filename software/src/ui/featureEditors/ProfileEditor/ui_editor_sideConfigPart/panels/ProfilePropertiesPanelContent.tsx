import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { SectionHeaderText } from '~/ui/elements';
import { ProfileConfigurationDisplayPart } from '~/ui/featureEditors/ProfileEditor/ui_editor_sideConfigPart/blocks/ProfileConfigurationDisplayPart';

export const ProfilePropertiesPanelContent: FC = () => {
  return (
    <div class={style}>
      <SectionHeaderText
        text={texts.assignerProfilePropertiesPart.sectionHeader}
        icon="article"
        xOffset={-4}
        hint={texts.assignerProfilePropertiesPartHint.sectionHeader}
      />
      <div class="body">
        <ProfileConfigurationDisplayPart />
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
