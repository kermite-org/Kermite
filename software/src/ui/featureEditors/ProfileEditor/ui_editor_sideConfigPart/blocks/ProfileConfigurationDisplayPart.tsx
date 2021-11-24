import { css, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { assignerModel } from '~/ui/featureEditors/ProfileEditor/models/AssignerModel';
import { profilesReader } from '~/ui/pages/assigner-page/models';
import { uiReaders } from '~/ui/store';

export const ProfileConfigurationDisplayPart = () => {
  const projectInfos = uiReaders.allProjectPackageInfos;
  const projectId = assignerModel.profileData.projectId;
  const info = projectInfos.find((it) => it.projectId === projectId);
  const keyboardName = info?.keyboardName;
  const currentAssignType = assignerModel.profileData.settings.assignType;

  const { isEditProfileAvailable } = profilesReader;

  return (
    <div css={style}>
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
