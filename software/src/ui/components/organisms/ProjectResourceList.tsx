import { css, FC, jsx } from 'qx';
import { IProjectResourceListItem, uiTheme } from '~/ui/base';
import { withStopPropagation } from '~/ui/helpers';

type Props = {
  className?: string;
  resourceItems: IProjectResourceListItem[];
  clearSelection(): void;
};

export const ProjectResourceList: FC<Props> = ({
  className,
  resourceItems,
  clearSelection,
}) => {
  const presets = resourceItems.filter((it) => it.itemType === 'preset');
  const layouts = resourceItems.filter((it) => it.itemType === 'layout');
  const firmwares = resourceItems.filter((it) => it.itemType === 'firmware');
  return (
    <div css={style} className={className} onClick={clearSelection}>
      <ResourceItemsBlock groupName="presets" items={presets} />
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
            {item.additionalInfoText} {item.itemName}
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

        &:hover {
          background: #0bd2;
        }
        &.--selected {
          background: ${uiTheme.colors.clSelectHighlight};
        }
      }
    }
  }
  > * + * {
    margin-top: 5px;
  }
`;
