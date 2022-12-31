import { FC, jsx, useMemo } from 'alumina';
import { diProfileEditor } from './di';

function createStore(itemPath: string) {
  const layout = diProfileEditor.loadProfile(itemPath);
  return {
    layout,
  };
}

export const ProfileEditorView: FC<{ itemPath: string }> = ({ itemPath }) => {
  const { layout } = useMemo(() => createStore(itemPath), [itemPath]);

  return (
    <div>
      profile editor
      {JSON.stringify(layout, null, ' ')}
    </div>
  );
};
