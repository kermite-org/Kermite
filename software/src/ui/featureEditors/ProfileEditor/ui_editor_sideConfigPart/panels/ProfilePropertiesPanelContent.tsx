import { css, FC, jsx } from 'alumina';
import { SectionHeaderText } from '~/ui/elements';
import { ProfileConfigurationDisplayPart } from '~/ui/featureEditors/ProfileEditor/ui_editor_sideConfigPart/blocks/ProfileConfigurationDisplayPart';

export const ProfilePropertiesPanelContent: FC = () => {
  return (
    <div class={style}>
      <SectionHeaderText
        text="Profile Properties"
        icon="article"
        xOffset={-4}
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
