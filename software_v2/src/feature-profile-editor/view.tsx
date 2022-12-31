import { FC, jsx, useMemo } from 'alumina';
import { diProfileEditor } from './di';
import { AssignerGeneralComponent } from './profileEditor';

function createStore(itemPath: string) {
  const profile = diProfileEditor.loadProfile(itemPath);
  const [projectId, ,] = itemPath.split('/');
  const layoutName = profile.referredLayoutName;
  const layoutItemPath = `${projectId}/layout/${layoutName}`;
  const layout = diProfileEditor.loadLayout(layoutItemPath);

  return {
    profile,
    layout,
  };
}

export const ProfileEditorView: FC<{ itemPath: string }> = ({ itemPath }) => {
  const { profile, layout } = useMemo(() => createStore(itemPath), [itemPath]);
  return (
    <AssignerGeneralComponent
      originalProfile={profile}
      keyboardLayout={layout}
    />
  );
};
