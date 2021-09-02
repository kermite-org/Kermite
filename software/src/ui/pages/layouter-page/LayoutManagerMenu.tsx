import { jsx } from 'qx';
import { GeneralButtonMenu } from '~/ui/components';
import { createLayoutManagerMenuItems } from '~/ui/pages/layouter-page/models/LayoutManagerMenuModel';
import { ILayoutManagerViewModel } from '~/ui/pages/layouter-page/models/LayoutManagerViewModel';

export const LayoutManagerMenu = (props: {
  baseVm: ILayoutManagerViewModel;
}) => {
  const { baseVm } = props;
  const menuItems = createLayoutManagerMenuItems(baseVm);
  return <GeneralButtonMenu menuItems={menuItems} />;
};
