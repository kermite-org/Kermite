import { FC, jsx, useMemo } from 'alumina';
import { diLayoutEditor } from './di';

function createStore(itemPath: string) {
  const layout = diLayoutEditor.loadLayout(itemPath);
  return {
    layout,
  };
}

export const LayoutEditorView: FC<{ itemPath: string }> = ({ itemPath }) => {
  const { layout } = useMemo(() => createStore(itemPath), [itemPath]);

  return (
    <div>
      layout editor
      {JSON.stringify(layout, null, ' ')}
    </div>
  );
};
