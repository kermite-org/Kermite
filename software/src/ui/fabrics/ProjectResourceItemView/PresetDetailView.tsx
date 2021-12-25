import { css, FC, jsx, useMemo } from 'alumina';
import {
  fallbackProfileData,
  IProjectPackageInfo,
  ProfileDataConverter,
} from '~/shared';
import { PresetKeyboardViewWrapper } from '~/ui/fabrics/PresetKeyboardViewWrapper/view';

type Props = {
  projectInfo: IProjectPackageInfo;
  presetName: string;
};

export const PresetDetailView: FC<Props> = ({ projectInfo, presetName }) => {
  const profileData = useMemo(() => {
    const profileEntry = projectInfo.profiles.find(
      (profile) => profile.profileName === presetName,
    );
    return (
      (profileEntry &&
        ProfileDataConverter.convertProfileDataFromPersist(
          profileEntry.data,
        )) ||
      fallbackProfileData
    );
  }, [projectInfo, presetName]);
  return (
    <div css={style}>
      <PresetKeyboardViewWrapper profileData={profileData} />
    </div>
  );
};

const style = css`
  height: 200px;
  border: solid 1px #888;
`;
