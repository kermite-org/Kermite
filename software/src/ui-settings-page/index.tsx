import { css } from 'goober';
import { h, Hook } from 'qx';
import { IGlobalSettings } from '~/shared';
import {
  appUi,
  ipcAgent,
  reflectFieldChecked,
  uiTheme,
  useLocal,
} from '~/ui-common';

const cssUiSettingsPage = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 10px;

  > * + * {
    margin-top: 10px;
  }

  .filePathInput {
    width: 350px;
  }
`;

const fallbackGlobalSettings: IGlobalSettings = {
  useLocalResouces: false,
  useOnlineResources: false,
  localProjectRootFolderPath: '',
};

export const UiSettingsPage = () => {
  const local = useLocal({
    settings: fallbackGlobalSettings,
    fixedProjectRootPath: '',
  });

  Hook.useEffect(() => {
    (async () => {
      local.settings = await ipcAgent.async.config_getGlobalSettings();
      if (appUi.isDevelopment) {
        local.fixedProjectRootPath = await ipcAgent.async.config_getProjectRootDirectoryPath();
      }
    })();
    return () => ipcAgent.async.config_writeGlobalSettings(local.settings);
  }, []);

  const onSelectButton = async () => {
    const path = await ipcAgent.async.file_getOpenDirectoryWithDialog();
    if (path) {
      local.settings.localProjectRootFolderPath = path;
    }
  };

  const canChangeFolder = !appUi.isDevelopment;

  const folderPathDisplayValue =
    local.fixedProjectRootPath || local.settings.localProjectRootFolderPath;

  const { settings } = local;

  return (
    <div css={cssUiSettingsPage}>
      Configurations
      <div>
        <div>Resources</div>
        <div>
          <input
            type="checkbox"
            checked={settings.useOnlineResources}
            onChange={reflectFieldChecked(settings, 'useOnlineResources')}
          />
          <span>Use Online Project Resources</span>
        </div>
        <div>
          <input
            type="checkbox"
            checked={settings.useLocalResouces}
            onChange={reflectFieldChecked(settings, 'useLocalResouces')}
          />
          <span>Use Local Project Resources</span>
        </div>
        <div>
          <div>Kermite Root Directory</div>
          <input
            type="text"
            readOnly={true}
            value={folderPathDisplayValue}
            className="filePathInput"
            disabled={!canChangeFolder}
          ></input>
          <button onClick={onSelectButton} disabled={!canChangeFolder}>
            select
          </button>
        </div>
      </div>
    </div>
  );
};
