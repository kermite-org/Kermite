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
  resourceId: string;
  itemType: IProjectResourceItemType;
  itemName: string;
  additionalInfoText?: string;
};

export const ProjectEditPage: FC = () => {
  const [editCustomFirmwareResourceId, setEditCustomFirmwareResourceId] =
    useState<string | undefined>(undefined);

  const openCustomFirmwareModal = setEditCustomFirmwareResourceId;
  const closeCustomFirmwareModal = () =>
    setEditCustomFirmwareResourceId(undefined);

  const projectInfo = projectPackagesHooks.useEditTargetProject();

  const keyboardName = projectInfo.keyboardName;

  const handleKeyboardNameChange = (value: string) => {
    const newProjectInfo = { ...projectInfo, keyboardName: value };
    projectPackagesWriter.saveLocalProject(newProjectInfo);
  };

  const resourceItems: IProjectResourceItem[] = [
    ...projectInfo.firmwares.map((it) => ({
      itemType: 'firmware' as const,
      itemName: it.variationName,
      resourceId: it.resourceId,
      additionalInfoText: `(${it.type})`,
    })),
    ...projectInfo.layouts.map((it) => ({
      itemType: 'layout' as const,
      itemName: it.layoutName,
      resourceId: it.resourceId,
    })),
    ...projectInfo.presets.map((it) => ({
      itemType: 'preset' as const,
      itemName: it.presetName,
      resourceId: it.resourceId,
    })),
  ];

  const editResourceItem = (resourceId: string) => {
    const item = resourceItems.find((it) => it.resourceId === resourceId)!;
    const { itemType } = item;
    if (itemType === 'preset') {
      uiActions.navigateTo({
        type: 'projectPresetEdit',
        presetResourceId: resourceId,
      });
    } else if (itemType === 'layout') {
      uiActions.navigateTo({
        type: 'projectLayoutEdit',
        layoutResourceId: resourceId,
      });
    } else if (itemType === 'firmware') {
      const firmwareInfo = projectInfo.firmwares.find(
        (it) => it.resourceId === resourceId,
      );
      if (firmwareInfo?.type === 'standard') {
        uiActions.navigateTo({
          type: 'projectFirmwareEdit',
          firmwareResourceId: resourceId,
        });
      } else if (firmwareInfo?.type === 'custom') {
        openCustomFirmwareModal(resourceId);
      }
    }
  };

  const createStandardFirmware = () => {
    uiActions.navigateTo({
      type: 'projectFirmwareEdit',
      firmwareResourceId: '',
    });
  };

  const createCustomFirmware = () => {
    openCustomFirmwareModal('');
  };

  const deleteResourceItem = async (resourceId: string) => {
    const ok = await modalConfirm({
      caption: 'delete item',
      message: 'Resource item delete. Are you sure?',
    });
    if (ok) {
      projectPackagesWriter.deleteProjectResourceItem(resourceId);
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
          <div key={item.resourceId}>
            <span>
              [{item.itemType}]({item.resourceId}){item.additionalInfoText}{' '}
              {item.itemName}
            </span>
            <button onClick={() => editResourceItem(item.resourceId)}>
              edit
            </button>
            <button onClick={() => deleteResourceItem(item.resourceId)}>
              delete
            </button>
          </div>
        ))}
      </div>
      {editCustomFirmwareResourceId !== undefined && (
        <ProjectCustomFirmwareSetupModal
          resourceId={editCustomFirmwareResourceId}
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
