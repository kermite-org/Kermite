import { FC, jsx } from 'qx';
import { GeneralButtonMenu } from '~/ui/components';
import { createLayoutManagerMenuItems } from '~/ui/pages/layouter-page/models/LayoutManagerMenuModel';

export const LayoutManagerMenu: FC = () => {
  const menuItems = createLayoutManagerMenuItems();
  return <GeneralButtonMenu menuItems={menuItems} />;
};
