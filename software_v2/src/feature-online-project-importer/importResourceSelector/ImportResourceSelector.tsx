import { FC, jsx } from 'alumina';
import { IProjectPackage, reflectChecked } from '~/app-shared';

type InputProps = {
  localProject: IProjectPackage;
  remoteProject: IProjectPackage;
};

type IItemType = 'profile' | 'layout' | 'firmware';
type IResourceListItem = {
  itemKey: string;
  label: string;
  itemType: IItemType;
  itemName: string;
  selected: boolean;
  canSelect: boolean;
};

type IOutputProps = {
  importItems: {
    itemType: IItemType;
    itemName: string;
  }[];
};

export function createImportResourceSelectorStore() {
  const state = {
    resourceListItems: undefined! as IResourceListItem[],
  };

  const readers = {
    getListItemEntities() {},
  };

  const actions = {
    setItemChecked(itemKey: string, checked: boolean) {
      const item = state.resourceListItems.find((it) => it.itemKey === itemKey);
      if (item) {
        item.selected = checked;
      }
    },
  };

  function setInputProps(props: InputProps) {
    const { profiles, layouts, firmwares } = props.remoteProject;
    state.resourceListItems = [
      ...profiles.map((it) => ({
        itemType: 'profile' as const,
        itemName: it.name,
        itemKey: `profile__${it.name}`,
        label: it.name,
        selected: false,
        canSelect: true,
      })),
      ...layouts.map((it) => ({
        itemType: 'layout' as const,
        itemName: it.name,
        itemKey: `layout__${it.name}`,
        label: it.name,
        selected: false,
        canSelect: true,
      })),
      ...firmwares.map((it) => ({
        itemType: 'firmware' as const,
        itemName: it.name,
        itemKey: `firmware__${it.name}`,
        label: it.name,
        selected: false,
        canSelect: true,
      })),
    ];
  }

  function getOutputProps(): IOutputProps {
    const importItems = state.resourceListItems
      .filter((it) => it.selected)
      .map((it) => ({ itemType: it.itemType, itemName: it.itemName }));
    return { importItems };
  }

  return { state, readers, actions, setInputProps, getOutputProps };
}

type IImportResourceSelectorStore = ReturnType<
  typeof createImportResourceSelectorStore
>;

export const ImportResourceSelector: FC<{
  store: IImportResourceSelectorStore;
}> = ({ store }) => {
  const {
    state: { resourceListItems },
    actions: { setItemChecked },
  } = store;
  return (
    <div>
      <ul>
        {resourceListItems.map((item) => (
          <li key={item.itemKey}>
            <input
              type="checkbox"
              onChange={reflectChecked((checked) =>
                setItemChecked(item.itemKey, checked),
              )}
            ></input>
            ({item.itemType}) {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
