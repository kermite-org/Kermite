import { css, FC, jsx } from 'qx';
import { decodeProjectResourceItemKey } from '~/shared';
import { GeneralButton } from '~/ui/components';
import { projectResourceActions } from '~/ui/pages/ProjectResourcePage/core/ProjectResourceActions';

export const ResourceItemDetailView: FC<{
  className?: string;
  selectedItemKey: string;
}> = ({ selectedItemKey }) => {
  const { itemType, itemName } = decodeProjectResourceItemKey(selectedItemKey);
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
          {itemType} {itemName}
        </div>
        <GeneralButton onClick={() => editSelectedResourceItem()}>
          edit
        </GeneralButton>
      </div>
    </div>
  );
};
