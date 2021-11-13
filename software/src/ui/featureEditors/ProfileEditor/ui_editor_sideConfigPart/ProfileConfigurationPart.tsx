import { css, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { assignerModel } from '~/ui/featureEditors/ProfileEditor/models/AssignerModel';
import { profilesReader } from '~/ui/pages/assigner-page/models';
import { uiReaders } from '~/ui/store';

export const ProfileConfigurationPart = () => {
  const projectInfos = uiReaders.allProjectPackageInfos;
  const projectId = assignerModel.profileData.projectId;
  const info = projectInfos.find((it) => it.projectId === projectId);
  const keyboardName = info?.keyboardName;
  const currentAssignType = assignerModel.profileData.settings.assignType;

  const { isEditProfileAvailable } = profilesReader;

  return (
    <div css={style}>
      <div>keyboard: {keyboardName}</div>
      <div
        data-hint={texts.hint_assigner_configs_assignModel}
        qxIf={isEditProfileAvailable}
      >
        {texts.label_assigner_configs_assignModel}: {currentAssignType}
      </div>
    </div>
  );
};

const style = css`
  padding: 5px;

  > * + * {
    margin-top: 5px;
  }
`;
