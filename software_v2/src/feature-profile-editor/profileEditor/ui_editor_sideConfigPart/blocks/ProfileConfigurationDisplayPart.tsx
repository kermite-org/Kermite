import { css, jsx } from 'alumina';
import { texts } from '~/app-shared';
// import { profilesReader } from '~/ui/pages/assignerPage/models';
// import { uiReaders } from '~/ui/store';
import { profileEditorConfig } from '../../adapters';
import { assignerModel } from '../../models';

export const ProfileConfigurationDisplayPart = () => {
  const projectInfos = profileEditorConfig.allProjectPackageInfos;
  const projectId = assignerModel.profileData.projectId;
  const info = projectInfos.find((it) => it.projectId === projectId);
  const keyboardName = info?.keyboardName;
  const currentAssignType = assignerModel.profileData.settings.assignType;

  const { isEditProfileAvailable } = profileEditorConfig;

  return (
    <div class={style}>
      <div data-hint={texts.assignerProfilePropertiesPartHint.keyboard}>
        {texts.assignerProfilePropertiesPart.keyboard}: {keyboardName}
      </div>
      <div
        data-hint={texts.assignerProfilePropertiesPartHint.assignModel}
        if={isEditProfileAvailable}
      >
        {texts.assignerProfilePropertiesPart.assignModel}: {currentAssignType}
      </div>
    </div>
  );
};

const style = css`
  > * + * {
    margin-top: 5px;
  }
`;
