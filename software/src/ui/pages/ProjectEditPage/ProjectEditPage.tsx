import { css, FC, jsx, useState } from 'qx';
import { uiTheme } from '~/ui/base';
import {
  uiActions,
  projectPackagesHooks,
  projectPackagesWriter,
} from '~/ui/commonStore';
import { modalConfirm } from '~/ui/components';
import { reflectValue } from '~/ui/helpers';
import { ProjectCustomFirmwareSetupModal } from '~/ui/pages/ProjectCustomFirmwareSetupModal/ProjectCustomFirmwareSetupModal';

type IProjectResourceItemType = 'preset' | 'layout' | 'firmware';
type IProjectResourceItem = {
  itemKey: string;
  itemType: IProjectResourceItemType;
  itemName: string;
  additionalInfoText?: string;
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
  const [editCustomFirmwareVariationName, setEditCustomFirmwareVariationName] =
    useState<string | undefined>(undefined);

  const openCustomFirmwareModal = setEditCustomFirmwareVariationName;
  const closeCustomFirmwareModal = () =>
    setEditCustomFirmwareVariationName(undefined);

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
      additionalInfoText: `(${it.type})`,
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
      const variationName = itemName;
      const firmwareInfo = projectInfo.firmwares.find(
        (it) => it.variationName === variationName,
      );
      if (firmwareInfo?.type === 'standard') {
        uiActions.navigateTo({
          type: 'projectFirmwareEdit',
          variationName,
        });
      } else if (firmwareInfo?.type === 'custom') {
        openCustomFirmwareModal(variationName);
      }
    }
  };

  const createStandardFirmware = () => {
    uiActions.navigateTo({ type: 'projectFirmwareEdit', variationName: '' });
  };

  const createCustomFirmware = () => {
    openCustomFirmwareModal('');
  };

  const deleteResourceItem = async (itemKey: string) => {
    const ok = await modalConfirm({
      caption: 'delete item',
      message: 'Resource item delete. Are you sure?',
    });
    if (ok) {
      const { itemType, itemName } = decodeProjectResourceItemKey(itemKey);
      if (itemType === 'preset') {
        projectPackagesWriter.deleteLocalProjectPreset(itemName);
      } else if (itemType === 'layout') {
        projectPackagesWriter.deleteLocalProjectLayout(itemName);
      } else if (itemType === 'firmware') {
        projectPackagesWriter.deleteLocalProjectFirmware(itemName);
      }
    }
  };

  return (
    <div css={style}>
      <div>project resource edit page</div>

      <div>
        <div>
          <button onClick={createStandardFirmware}>
            Create Standard Firmware
          </button>
        </div>
        <div>
          <button onClick={createCustomFirmware}>Create Custom Firmware</button>
        </div>
      </div>
      <div>
        <label>
          <span>keyboard name</span>
          <input
            className="keyboard-name-input"
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
              [{item.itemType}]{item.additionalInfoText} {item.itemName}
            </span>
            <button onClick={() => editResourceItem(item.itemKey)}>edit</button>
            <button onClick={() => deleteResourceItem(item.itemKey)}>
              delete
            </button>
          </div>
        ))}
      </div>
      {editCustomFirmwareVariationName !== undefined && (
        <ProjectCustomFirmwareSetupModal
          variationName={editCustomFirmwareVariationName}
          close={closeCustomFirmwareModal}
        />
      )}
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

  .keyboard-name-input {
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
