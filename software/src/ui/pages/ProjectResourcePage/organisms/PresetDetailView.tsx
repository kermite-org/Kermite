import { css, FC, jsx } from 'qx';
import { PresetKeyboardView } from '~/ui/components';
import { useMemoEx } from '~/ui/helpers';
import { projectResourceHelpers } from '~/ui/pages/ProjectResourcePage/core';
import { usePresetKeyboardViewModel } from '~/ui/pages/preset-browser-page/viewModels';

type Props = {
  presetName: string;
};

export const PresetDetailView: FC<Props> = ({ presetName }) => {
  const profileData = useMemoEx(projectResourceHelpers.loadProfileData, [
    presetName,
  ]);
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
