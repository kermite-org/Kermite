import { css, FC, jsx } from 'qx';
import { IProjectResourceItemType } from '~/shared';
import { uiTheme } from '~/ui/base';

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
}) => {
  const presets = resourceItems.filter((it) => it.itemType === 'preset');
  const layouts = resourceItems.filter((it) => it.itemType === 'layout');
  const firmwares = resourceItems.filter((it) => it.itemType === 'firmware');
  return (
    <div css={style} className={className}>
      <ResourceItemsBlock groupName="presets" items={presets} />
      <ResourceItemsBlock groupName="layouts" items={layouts} />
      <ResourceItemsBlock groupName="firmwares" items={firmwares} />
    </div>
  );
};

const ResourceItemsBlock = (props: {
  groupName: string;
  items: IProjectResourceItem[];
}) => {
  const { groupName, items } = props;
  return (
    <div className="block">
      <div className="header">📁{groupName}</div>
      <div className="items">
        {items.map((item) => (
          <div key={item.itemKey}>
            <span>
              {item.additionalInfoText} {item.itemName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const style = css`
  border: solid 1px #888;
  color: ${uiTheme.colors.clAltText};
  padding: 10px;
  height: 100%;

  > .block {
    > .header {
    }
    > .items {
      padding-left: 15px;
    }
  }
  > * + * {
    margin-top: 5px;
  }
`;
