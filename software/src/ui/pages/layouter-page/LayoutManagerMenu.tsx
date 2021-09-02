import { jsx } from 'qx';
import { GeneralButtonMenu } from '~/ui/components';
import { createLayoutManagerMenuItems } from '~/ui/pages/layouter-page/LayoutManagerMenu.model';
import { ILayoutManagerViewModel } from '~/ui/pages/layouter-page/LayoutManagerViewModel';

export const LayoutManagerMenu = (props: {
  baseVm: ILayoutManagerViewModel;
}) => {
  const { baseVm } = props;
  const menuItems = createLayoutManagerMenuItems(baseVm);
  return <GeneralButtonMenu menuItems={menuItems} />;
};
