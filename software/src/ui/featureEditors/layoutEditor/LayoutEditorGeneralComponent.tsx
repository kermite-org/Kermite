import { FC, jsx, useEffect } from 'alumina';
import { IPersistKeyboardDesign } from '~/shared';
import { LayoutEditorCore } from '~/ui/featureEditors/layoutEditor/LayoutEditorCore';

type Props = {
  layout: IPersistKeyboardDesign;
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
