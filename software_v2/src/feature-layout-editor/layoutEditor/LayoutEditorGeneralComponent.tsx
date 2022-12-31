import { FC, jsx, useEffect } from 'alumina';
import { IPersistKeyboardLayout } from '~/app-shared';
import { LayoutEditorCore } from './LayoutEditorCore';

type Props = {
  layout: IPersistKeyboardLayout;
};

export const LayoutEditorGeneralComponent_OutputPropsSupplier = {
  get isModified() {
    return LayoutEditorCore.getIsModified();
  },
  emitSavingDesign() {
    return LayoutEditorCore.emitSavingDesign();
  },
};

export const LayoutEditorGeneralComponent: FC<Props> = ({ layout }) => {
  useEffect(() => {
    LayoutEditorCore.preserveEditState();
    LayoutEditorCore.loadEditDesign(layout);

    return () => LayoutEditorCore.restoreEditState();
  }, [layout]);

  return <LayoutEditorCore.Component />;
};
