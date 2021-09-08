import { css, FC, jsx } from 'qx';
import { cloneObject, fallbackProfileData, IProfileData } from '~/shared';
import { PresetKeyboardView } from '~/ui/components';
import { useMemoEx } from '~/ui/helpers';
import { projectResourceHelpers } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceHelpers';
import { usePresetKeyboardViewModel } from '~/ui/pages/preset-browser-page/viewModels';

type Props = {
  layoutName: string;
};

function loadLayoutProfileData(layoutName: string): IProfileData {
  const layoutEntry = projectResourceHelpers.getLayoutEntry(layoutName);
  const profileData = cloneObject(fallbackProfileData);
  profileData.keyboardDesign = layoutEntry.data;
  return profileData;
}

export const LayoutDetailView: FC<Props> = ({ layoutName }) => {
  const profileData = useMemoEx(loadLayoutProfileData, [layoutName]);
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
