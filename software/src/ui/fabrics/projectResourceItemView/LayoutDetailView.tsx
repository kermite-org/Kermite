import { css, FC, jsx, useMemo } from 'alumina';
import {
  cloneObject,
  fallbackProfileData,
  IProjectPackageInfo,
} from '~/shared';
import { PresetKeyboardViewWrapper } from '~/ui/fabrics/PresetKeyboardViewWrapper/view';

type Props = {
  projectInfo: IProjectPackageInfo;
  layoutName: string;
};

export const LayoutDetailView: FC<Props> = ({ projectInfo, layoutName }) => {
  const profileData = useMemo(() => {
    const layoutEntry = projectInfo.layouts.find(
      (la) => la.layoutName === layoutName,
    );
    const profileData = cloneObject(fallbackProfileData);
    if (layoutEntry) {
      profileData.keyboardDesign = layoutEntry.data;
    }
    return profileData;
  }, [projectInfo, layoutName]);
  return (
    <div class={style}>
      <PresetKeyboardViewWrapper profileData={profileData} />
    </div>
  );
};

const style = css`
  height: 200px;
  border: solid 1px #888;
`;
