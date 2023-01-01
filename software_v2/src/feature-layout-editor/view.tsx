import { css, domStyled, FC, jsx, useMemo } from 'alumina';
import { RouteHeaderBar } from '~/fe-shared';
import { diLayoutEditor } from './di';
import {
  LayoutEditorGeneralComponent,
  LayoutEditorGeneralComponent_OutputPropsSupplier,
} from './layoutEditor';

function createStore(itemPath: string) {
  const layoutName = itemPath.split('/')[2];
  const state = {
    layout: diLayoutEditor.loadLayout(itemPath),
  };

  return {
    layoutName,
    get layout() {
      return state.layout;
    },
    get isModified() {
      return LayoutEditorGeneralComponent_OutputPropsSupplier.isModified;
    },
    saveLayout() {
      const newLayout =
        LayoutEditorGeneralComponent_OutputPropsSupplier.emitSavingDesign();
      diLayoutEditor.saveLayout(itemPath, newLayout);
      state.layout = newLayout;
    },
  };
}

export const LayoutEditorView: FC<{ itemPath: string }> = ({ itemPath }) => {
  const { layoutName, layout, isModified, saveLayout } = useMemo(
    () => createStore(itemPath),
    [itemPath],
  );

  return domStyled(
    <div>
      <RouteHeaderBar
        title={`edit layout: ${layoutName}`}
        // backHandler={() => {}}
        canSave={isModified}
        saveHandler={saveLayout}
      />
      <LayoutEditorGeneralComponent layout={layout} />
    </div>,
    css`
      height: 100%;
      display: flex;
      flex-direction: column;
    `,
  );
};
