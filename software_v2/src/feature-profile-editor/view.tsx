import { FC, jsx, useMemo } from 'alumina';
import { getDisplayKeyboardDesignSingleCached } from '~/app-shared';
import { diProfileEditor } from './di';

function createStore(itemPath: string) {
  const profile = diProfileEditor.loadProfile(itemPath);
  const [projectId, ,] = itemPath.split('/');
  const layoutName = profile.referredLayoutName;
  const layoutItemPath = `${projectId}/layout/${layoutName}`;
  const layout = diProfileEditor.loadLayout(layoutItemPath);

  const displayDesign = getDisplayKeyboardDesignSingleCached(layout);

  return {
    profile,
    displayDesign,
  };
}

export const ProfileEditorView: FC<{ itemPath: string }> = ({ itemPath }) => {
  const { profile, displayDesign } = useMemo(
    () => createStore(itemPath),
    [itemPath],
  );

  return (
    <div>
      profile editor
      {JSON.stringify(profile, null, ' ')}
      {JSON.stringify(displayDesign, null, ' ')}
    </div>
  );
};
