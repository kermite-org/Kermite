import { css, FC, jsx, useMemo } from 'qx';
import { PresetKeyboardView } from '~/ui/components';
import { projectResourceHelpers } from '~/ui/pages/ProjectResourcePage/core';
import { usePresetKeyboardViewModel } from '~/ui/pages/preset-browser-page/viewModels';
import { uiReaders } from '~/ui/store';

type Props = {
  layoutName: string;
};

export const LayoutDetailView: FC<Props> = ({ layoutName }) => {
  const profileData = useMemo(
    () => projectResourceHelpers.loadLayoutProfileData(layoutName),
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
