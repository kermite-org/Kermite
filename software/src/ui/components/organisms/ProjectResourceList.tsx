import { css, FC, jsx } from 'qx';
import { IProjectResourceItemType } from '~/shared';

export type IProjectResourceItem = {
  itemKey: string;
  itemType: IProjectResourceItemType;
  itemName: string;
  additionalInfoText?: string;
};

type Props = {
  className?: string;
  resourceItems: IProjectResourceItem[];
  selectedItemKey: string;
};
export const ProjectResourceList: FC<Props> = ({
  className,
  resourceItems,
}) => (
  <div css={style} className={className}>
    {resourceItems.map((item) => (
      <div key={item.itemKey}>
        <span>
          [{item.itemType}]{item.additionalInfoText} {item.itemName}
        </span>
      </div>
    ))}
  </div>
);

const style = css``;
