import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import {
  uiActions,
  projectPackagesHooks,
  projectPackagesWriter,
} from '~/ui/commonStore';
import { modalConfirm } from '~/ui/components';
import { reflectValue } from '~/ui/helpers';

type IProjectResourceItemType = 'preset' | 'layout' | 'firmware';
type IProjectResourceItem = {
  itemKey: string;
  itemType: IProjectResourceItemType;
  itemName: string;
};

function encodeProjectResourceItemKey(
  itemType: IProjectResourceItemType,
  itemName: string,
): string {
  return `${itemType}#${itemName}`;
}

function decodeProjectResourceItemKey(key: string): {
  itemType: IProjectResourceItemType;
  itemName: string;
} {
  const [itemType, itemName] = key.split('#');
  return { itemType: itemType as IProjectResourceItemType, itemName };
}

export const ProjectEditPage: FC = () => {
  const projectInfo = projectPackagesHooks.useEditTargetProject();

  const keyboardName = projectInfo.keyboardName;

  const handleKeyboardNameChange = (value: string) => {
    const newProjectInfo = { ...projectInfo, keyboardName: value };
    projectPackagesWriter.saveLocalProject(newProjectInfo);
  };

  const resourceItems: IProjectResourceItem[] = [
    ...projectInfo.firmwares.map((it) => ({
      itemKey: encodeProjectResourceItemKey('firmware', it.variationName),
      itemType: 'firmware' as const,
      itemName: it.variationName,
    })),
    ...projectInfo.layouts.map((it) => ({
      itemKey: encodeProjectResourceItemKey('layout', it.layoutName),
      itemType: 'layout' as const,
      itemName: it.layoutName,
    })),
    ...projectInfo.presets.map((it) => ({
      itemKey: encodeProjectResourceItemKey('preset', it.presetName),
      itemType: 'preset' as const,
      itemName: it.presetName,
    })),
  ];

  const editResourceItem = (itemKey: string) => {
    const { itemType, itemName } = decodeProjectResourceItemKey(itemKey);
    if (itemType === 'preset') {
      uiActions.navigateTo({ type: 'projectPresetEdit', presetName: itemName });
    } else if (itemType === 'layout') {
      uiActions.navigateTo({ type: 'projectLayoutEdit', layoutName: itemName });
    } else if (itemType === 'firmware') {
      modalConfirm({ message: 'unimplemented yet', caption: 'note' });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteResourceItem = (itemKey: string) => {};

  return (
    <div css={style}>
      <div>project resource edit page</div>
      <div>
        <label>
          <span>keyboard name</span>
          <input
            type="text"
            value={keyboardName}
            onChange={reflectValue(handleKeyboardNameChange)}
          />
        </label>
      </div>
      <div className="items-box">
        {resourceItems.map((item) => (
          <div key={item.itemKey}>
            <span>
              [{item.itemType}] {item.itemName}
            </span>
            <button onClick={() => editResourceItem(item.itemKey)}>edit</button>
            <button
              onClick={() => deleteResourceItem(item.itemKey)}
              qxIf={false}
            >
              delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 15px;

  > * + * {
    margin-top: 10px;
  }

  .items-box {
    display: inline-block;
    border: solid 1px #888;
    color: ${uiTheme.colors.clAltText};
    padding: 10px;

    > * + * {
      margin-top: 5px;
    }

    button {
      margin-left: 5px;
    }
  }

  input {
    margin-left: 10px;
  }

  pre {
    border: solid 1px #888;
    color: #222;
    padding: 10px;
    width: 300px;
    font-size: 14px;
  }
`;
