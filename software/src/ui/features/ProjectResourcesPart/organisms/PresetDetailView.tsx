import { css, FC, jsx, useMemo } from 'alumina';
import { PresetKeyboardViewWrapper } from '~/ui/fabrics';
import { projectResourceStore } from '~/ui/features/ProjectResourcesPart/store';
import { uiReaders } from '~/ui/store';

type Props = {
  presetName: string;
};

export const PresetDetailView: FC<Props> = ({ presetName }) => {
  const profileData = useMemo(
    () => projectResourceStore.helpers.loadProfileData(presetName),
    [presetName, uiReaders.allProjectPackageInfos],
  );
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
