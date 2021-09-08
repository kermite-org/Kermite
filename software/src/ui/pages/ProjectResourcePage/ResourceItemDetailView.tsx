import { css, FC, jsx } from 'qx';
import { IProjectResourceListItem } from '~/ui/base';
import { GeneralButton } from '~/ui/components';
import { projectResourceActions } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceActions';

export const ResourceItemDetailView: FC<{
  className?: string;
  item: IProjectResourceListItem;
}> = ({ item }) => {
  const { editSelectedResourceItem } = projectResourceActions;
  const style = css`
    padding: 10px;
    > .header {
      display: flex;
      justify-content: space-between;
    }
  `;
  return (
    <div css={style}>
      <div className="header">
        <div>
          {item.itemType} {item.itemName}
        </div>
        <GeneralButton onClick={() => editSelectedResourceItem()}>
          edit
        </GeneralButton>
      </div>
    </div>
  );
};
