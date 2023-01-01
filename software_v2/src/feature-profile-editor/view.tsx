import { css, domStyled, FC, jsx, useEffect } from 'alumina';
import { RouteHeaderBar } from '~/fe-shared';
import { AssignerGeneralComponent } from './profileEditor';
import { profileEditorStore } from './store';

export const ProfileEditorView: FC<{ itemPath: string }> = ({ itemPath }) => {
  const {
    readers: { profileName, profile, layout, isModified },
    actions: { loadProfile, unloadProfile, saveProfile },
  } = profileEditorStore;

  useEffect(() => {
    loadProfile(itemPath);
    return unloadProfile;
  }, [itemPath]);

  return domStyled(
    <div>
      <RouteHeaderBar
        title={`edit profile: ${profileName}`}
        // backHandler={() => {}}
        canSave={isModified}
        saveHandler={saveProfile}
      />
      <AssignerGeneralComponent
        originalProfile={profile}
        keyboardLayout={layout}
      />
    </div>,
    css`
      height: 100%;
      display: flex;
      flex-direction: column;
    `,
  );
};
