import { css, domStyled, FC, jsx, useMemo } from 'alumina';
import { RouteHeaderBar } from '~/fe-shared';
import { diProfileEditor } from './di';
import {
  AssignerGeneralComponent,
  AssignerGeneralComponent_OutputPropsSupplier,
} from './profileEditor';

function createStore(itemPath: string) {
  const [projectId, _, profileName] = itemPath.split('/');
  const state = {
    profile: diProfileEditor.loadProfile(itemPath),
  };
  const layoutName = state.profile.referredLayoutName;
  const layoutItemPath = `${projectId}/layout/${layoutName}`;
  const layout = diProfileEditor.loadLayout(layoutItemPath);

  return {
    profileName,
    get profile() {
      return state.profile;
    },
    get isModified() {
      return AssignerGeneralComponent_OutputPropsSupplier.isModified;
    },
    saveProfile() {
      const newProfile =
        AssignerGeneralComponent_OutputPropsSupplier.emitSavingDesign();
      diProfileEditor.saveProfile(itemPath, newProfile);
      state.profile = newProfile;
    },
    layout,
  };
}

export const ProfileEditorView: FC<{ itemPath: string }> = ({ itemPath }) => {
  const { profileName, profile, layout, isModified, saveProfile } = useMemo(
    () => createStore(itemPath),
    [itemPath],
  );
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
