import { jsx } from 'qx';
import { GeneralButtonMenu } from '~/ui/components';
import { useLayoutManagerMenuModel } from '~/ui/pages/layouter-page/LayoutManagerMenu.model';
import { ILayoutManagerViewModel } from '~/ui/pages/layouter-page/LayoutManagerViewModel';

export const LayoutManagerMenu = (props: {
  baseVm: ILayoutManagerViewModel;
}) => {
  const { baseVm } = props;
  const { menuItems } = useLayoutManagerMenuModel(baseVm);
  return <GeneralButtonMenu menuItems={menuItems} />;
};
