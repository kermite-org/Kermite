import { jsx, css, useLocal, useEffect } from 'qx';
import { uiTheme, ISelectorOption, ipcAgent, appUi, texts } from '~/ui/base';
import { globalSettingsModel, uiStatusModel } from '~/ui/commonModels';
import {
  Indent,
  CheckBoxLine,
  HFlex,
  GeneralInput,
  GeneralButton,
  RibbonSelector,
} from '~/ui/components';
import { useFetcher } from '~/ui/helpers';

const uiScaleOptions: ISelectorOption[] = [
  0.7,
  0.8,
  0.9,
  1,
  1.1,
  1.2,
  1.3,
].map((val) => ({ label: `${(val * 100) >> 0}%`, value: val.toString() }));

interface ISettingsPageModel {
  flagDeveloperMode: boolean;
  setFlagDeveloperMode: (value: boolean) => void;
  flagUseLocalResources: boolean;
  setFlagUseLocalResources: (value: boolean) => void;
  flagAllowCrossKeyboardKeyMappingWrite: boolean;
  setFlagAllowCrossKeyboardKeyMappingWrite: (value: boolean) => void;
  canChangeLocalRepositoryFolderPath: boolean;
  localRepositoryFolderPathDisplayValue: string;
  handleSelectLocalRepositoryFolder: () => void;
  isLocalRepositoryFolderPathValid: boolean;
  uiScalingOptions: ISelectorOption[];
  uiScalingSelectionValue: string;
  setUiScalingSelectionValue: (value: string) => void;
  appVersionInfo: string;
}

function useSettingsPageModel(): ISettingsPageModel {
  const local = useLocal({
    fixedProjectRootPath: '',
    temporaryInvalidLocalRepositoryFolderPath: '',
  });

  useEffect(() => {
    (async () => {
      if (appUi.isDevelopment) {
        local.fixedProjectRootPath = await ipcAgent.async.config_getProjectRootDirectoryPath();
      }
    })();
  }, []);

  const { globalSettings } = globalSettingsModel;

  const onSelectButton = async () => {
    const path = await ipcAgent.async.file_getOpenDirectoryWithDialog();
    if (path) {
      const valid = await ipcAgent.async.config_checkLocalRepositoryFolderPath(
        path,
      );
      if (!valid) {
        local.temporaryInvalidLocalRepositoryFolderPath = path;
      } else {
        local.temporaryInvalidLocalRepositoryFolderPath = '';
        globalSettingsModel.writeValue('localProjectRootFolderPath', path);
      }
    }
  };

  const folderPathDisplayValue =
    local.temporaryInvalidLocalRepositoryFolderPath ||
    local.fixedProjectRootPath ||
    globalSettings.localProjectRootFolderPath;

  const appVersionInfo = useFetcher(
    ipcAgent.async.system_getApplicationVersionInfo,
    { version: '' },
  )?.version;

  const isDeveloperModeOn = globalSettings.developerMode;

  const canChangeFolder = !local.fixedProjectRootPath && isDeveloperModeOn;

  return {
    flagDeveloperMode: globalSettings.developerMode,
    setFlagDeveloperMode: (value) =>
      globalSettingsModel.writeValue('developerMode', value),

    flagUseLocalResources: globalSettings.useLocalResouces,
    setFlagUseLocalResources: (value) =>
      globalSettingsModel.writeValue('useLocalResouces', value),

    flagAllowCrossKeyboardKeyMappingWrite:
      globalSettings.allowCrossKeyboardKeyMappingWrite,
    setFlagAllowCrossKeyboardKeyMappingWrite: (value) =>
      globalSettingsModel.writeValue(
        'allowCrossKeyboardKeyMappingWrite',
        value,
      ),

    canChangeLocalRepositoryFolderPath: canChangeFolder,
    localRepositoryFolderPathDisplayValue: folderPathDisplayValue,
    handleSelectLocalRepositoryFolder: onSelectButton,
    isLocalRepositoryFolderPathValid: !local.temporaryInvalidLocalRepositoryFolderPath,

    uiScalingOptions: uiScaleOptions,
    uiScalingSelectionValue: uiStatusModel.settings.siteDpiScale.toString(),
    setUiScalingSelectionValue: (strVal) =>
      (uiStatusModel.settings.siteDpiScale = parseFloat(strVal)),
    appVersionInfo,
  };
}

export const UiSettingsPage = () => {
  const {
    flagDeveloperMode,
    setFlagDeveloperMode,
    flagUseLocalResources,
    setFlagUseLocalResources,
    flagAllowCrossKeyboardKeyMappingWrite,
    setFlagAllowCrossKeyboardKeyMappingWrite,
    canChangeLocalRepositoryFolderPath,
    localRepositoryFolderPathDisplayValue,
    handleSelectLocalRepositoryFolder,
    isLocalRepositoryFolderPathValid,
    uiScalingOptions,
    uiScalingSelectionValue,
    setUiScalingSelectionValue,
    appVersionInfo,
  } = useSettingsPageModel();

  return (
    <div css={style}>
      <div>{texts.label_settings_pageTitle}</div>

      <Indent>
        <div>{texts.label_settings_header_resources}</div>
        <Indent>
          <CheckBoxLine
            text="Developer Mode"
            checked={flagDeveloperMode}
            setChecked={setFlagDeveloperMode}
          />
          <Indent>
            <CheckBoxLine
              text={texts.label_settings_configUseLocalProjectResources}
              hint={texts.hint_settings_configUseLocalProjectResources}
              checked={flagUseLocalResources}
              setChecked={setFlagUseLocalResources}
              disabled={!flagDeveloperMode}
            />
            <div>
              <div
                className={
                  !canChangeLocalRepositoryFolderPath && 'text-disabled'
                }
              >
                {texts.label_settings_configKermiteRootDirectory}
              </div>
              <HFlex>
                <GeneralInput
                  value={localRepositoryFolderPathDisplayValue}
                  disabled={!canChangeLocalRepositoryFolderPath}
                  readOnly={true}
                  width={350}
                  hint={texts.hint_settings_configKermiteRootDirectory}
                />
                <GeneralButton
                  onClick={handleSelectLocalRepositoryFolder}
                  disabled={!canChangeLocalRepositoryFolderPath}
                  icon="folder_open"
                  size="unitSquare"
                />
              </HFlex>
              <div style="color:red" qxIf={!isLocalRepositoryFolderPathValid}>
                invalid source folder path
              </div>
            </div>
            <CheckBoxLine
              text="Allow Cross Keyboard Keymapping Write"
              checked={flagAllowCrossKeyboardKeyMappingWrite}
              setChecked={setFlagAllowCrossKeyboardKeyMappingWrite}
              disabled={!flagDeveloperMode}
            />
          </Indent>
        </Indent>

        <div>{texts.label_settings_header_userInterface}</div>
        <Indent>
          <div>{texts.label_settings_configUiScaling}</div>
          <RibbonSelector
            options={uiScalingOptions}
            value={uiScalingSelectionValue}
            setValue={setUiScalingSelectionValue}
            hint={texts.hint_settings_configUiScaling}
          />
        </Indent>
      </Indent>

      <div className="version-area" qxIf={!!appVersionInfo}>
        application version: {appVersionInfo}
      </div>
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 10px;
  position: relative;

  > * + * {
    margin-top: 10px;
  }

  .version-area {
    position: absolute;
    top: 0;
    right: 0;
    margin: 10px;
  }

  .text-disabled {
    opacity: 0.4;
  }
`;
