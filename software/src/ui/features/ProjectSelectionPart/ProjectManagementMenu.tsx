import { FC, jsx } from 'qx';
import { GeneralButtonMenu } from '~/ui/components';
import { ProjectManagementMenuModel } from '~/ui/features/ProjectSelectionPart/ProjectManagementMenu.model';

type Props = {
  model: ProjectManagementMenuModel;
};

export const ProjectManagementMenu: FC<Props> = ({ model: { menuItems } }) => (
  <GeneralButtonMenu menuItems={menuItems} />
);
