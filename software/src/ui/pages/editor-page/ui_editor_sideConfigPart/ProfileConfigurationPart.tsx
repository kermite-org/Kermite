import { css, jsx } from 'qx';
import { texts } from '~/ui/base';
import { uiStateReader } from '~/ui/commonStore';
import { profilesReader } from '~/ui/pages/editor-page/models';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';

export const ProfileConfigurationPart = () => {
  const projectInfos = uiStateReader.allProjectPackageInfos;
  const projectId = editorModel.profileData.projectId;
  const info = projectInfos.find((it) => it.projectId === projectId);
  const keyboardName = info?.keyboardName;
  const currentAssignType = editorModel.profileData.settings.assignType;

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
