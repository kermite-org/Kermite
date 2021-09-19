import { css, FC, jsx, useMemo } from 'qx';
import { PresetKeyboardView } from '~/ui/components';
import { projectResourceHelpers } from '~/ui/pages/ProjectResourcePage/core';
import { usePresetKeyboardViewModel } from '~/ui/pages/preset-browser-page/viewModels';
import { uiReaders } from '~/ui/store';

type Props = {
  presetName: string;
};

export const PresetDetailView: FC<Props> = ({ presetName }) => {
  const profileData = useMemo(
    () => projectResourceHelpers.loadProfileData(presetName),
    [presetName, uiReaders.allProjectPackageInfos],
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
