import { css, FC, jsx, useMemo } from 'qx';
import { PresetKeyboardView } from '~/ui/components';
import { usePresetKeyboardViewModel } from '~/ui/features/PresetBrowser';
import { projectResourceStore } from '~/ui/features/ProjectResourcesPart/store';
import { uiReaders } from '~/ui/store';

type Props = {
  layoutName: string;
};

export const LayoutDetailView: FC<Props> = ({ layoutName }) => {
  const profileData = useMemo(
    () => projectResourceStore.helpers.loadLayoutProfileData(layoutName),
    [layoutName, uiReaders.allProjectPackageInfos],
  );
  const viewModel = usePresetKeyboardViewModel(profileData, '');
  return (
    <div css={style}>
      <PresetKeyboardView {...viewModel} />
    </div>
  );
};

const style = css`
  height: 200px;
  border: solid 1px #888;
`;