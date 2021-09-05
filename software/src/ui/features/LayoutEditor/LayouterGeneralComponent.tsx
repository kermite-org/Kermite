import { FC, jsx, useEffect } from 'qx';
import { IPersistKeyboardDesign } from '~/shared';
import { UiLayouterCore } from '~/ui/features/LayoutEditor/LayouterCore';

type Props = {
  layout: IPersistKeyboardDesign;
};

export const LayouterGeneralComponent_OutputPropsSupplier = {
  get isModified() {
    return UiLayouterCore.getIsModified();
  },
  emitSavingDesign() {
    return UiLayouterCore.emitSavingDesign();
  },
};

export const LayouterGeneralComponent: FC<Props> = ({ layout }) => {
  useEffect(() => {
    UiLayouterCore.loadEditDesign(layout);
  }, [layout]);

  return <UiLayouterCore.Component />;
};
