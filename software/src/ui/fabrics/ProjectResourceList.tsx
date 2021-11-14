import { css, FC, jsx } from 'alumina';
import {
  decodeProjectResourceItemKey,
  IProjectResourceItemType,
} from '~/shared';
import { colors, uiTheme } from '~/ui/base';
import { withStopPropagation } from '~/ui/utils';

type Props = {
  className?: string;
  resourceItemKeys: string[];
  selectedItemKey: string;
  setSelectedItemKey(itemKey: string): void;
  clearSelection(): void;
};

type IProjectResourceListItem = {
  itemKey: string;
  itemType: IProjectResourceItemType;
  itemName: string;
  selected: boolean;
  setSelected(): void;
};

function createResourceItems(
  resourceItemKeys: string[],
  selectedItemKey: string,
  setSelectedItemKey: (key: string) => void,
): {
  profiles: IProjectResourceListItem[];
  layouts: IProjectResourceListItem[];
  firmwares: IProjectResourceListItem[];
} {
  const resourceItems = resourceItemKeys.map((itemKey) => {
    const { itemType, itemName } = decodeProjectResourceItemKey(itemKey);
    return {
      itemKey,
      itemType,
      itemName,
      selected: itemKey === selectedItemKey,
      setSelected() {
        setSelectedItemKey(itemKey);
      },
    };
  });
  const profiles = resourceItems.filter((it) => it.itemType === 'profile');
  const layouts = resourceItems.filter((it) => it.itemType === 'layout');
  const firmwares = resourceItems.filter((it) => it.itemType === 'firmware');
  return {
    profiles,
    layouts,
    firmwares,
  };
}

export const ProjectResourceList: FC<Props> = ({
  className,
  resourceItemKeys,
  selectedItemKey,
  setSelectedItemKey,
  clearSelection,
}) => {
  const { profiles, layouts, firmwares } = createResourceItems(
    resourceItemKeys,
    selectedItemKey,
    setSelectedItemKey,
  );
  return (
    <div css={style} className={className} onClick={clearSelection}>
      <ResourceItemsBlock groupName="profiles" items={profiles} />
      <ResourceItemsBlock groupName="layouts" items={layouts} />
      <ResourceItemsBlock groupName="firmwares" items={firmwares} />
    </div>
  );
};

const ResourceItemsBlock = (props: {
  groupName: string;
  items: IProjectResourceListItem[];
}) => {
  const { groupName, items } = props;
  return (
    <div className="block">
      <div className="header">{groupName}</div>
      <div className="items">
        {items.map((item) => (
          <div
            key={item.itemKey}
            classNames={['item', item.selected && '--selected']}
            onClick={withStopPropagation(item.setSelected)}
          >
            {item.itemName}
          </div>
        ))}
      </div>
    </div>
  );
};

const style = css`
  border: solid 1px #888;
  color: ${colors.clAltText};
  padding: 10px;
  height: 100%;

  > .block {
    > .header {
      &:before {
        content: '📁';
        margin-right: 2px;
      }
    }
    > .items {
      padding-left: 17px;

      > .item {
        padding: 2px 5px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:hover {
          background: #0bd2;
        }
        &.--selected {
          background: ${colors.clSelectHighlight};
        }

        transition: ${uiTheme.commonTransitionSpec};
      }
    }
  }
  > * + * {
    margin-top: 5px;
  }
`;
