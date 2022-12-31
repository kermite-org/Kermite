import { css, FC, jsx } from 'alumina';
import { texts } from '~/app-shared';
import { SectionHeaderText } from '~/fe-shared';
import { ProfileConfigurationDisplayPart } from '../blocks';

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
