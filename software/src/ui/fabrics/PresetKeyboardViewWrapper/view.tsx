import { FC, jsx } from 'alumina';
import { IProfileData } from '~/shared';
import { PresetKeyboardView } from '~/ui/elements';
import { usePresetKeyboardViewWrapperModel } from '~/ui/fabrics/PresetKeyboardViewWrapper/model';

export const PresetKeyboardViewWrapper: FC<{ profileData: IProfileData }> = ({
  profileData,
}) => {
  const { keyUnits, displayArea, outlineShapes } =
    usePresetKeyboardViewWrapperModel(profileData);
  return (
    <PresetKeyboardView
      keyUnits={keyUnits}
      displayArea={displayArea}
      outlineShapes={outlineShapes}
    />
  );
};
