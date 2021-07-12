import { jsx, Hook, css } from 'qx';
import { IGlobalSettings } from '~/shared';
import {
  appUi,
  fieldSetter,
  ipcAgent,
  ISelectorOption,
  texts,
  uiTheme,
  useFetcher,
  useLocal,
  CheckBoxLine,
  GeneralButton,
  GeneralInput,
  HFlex,
  Indent,
  RibbonSelector,
  uiStatusModel,
} from '~/ui/common';

const cssUiSettingsPage = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 10px;
  position: relative;

  > * + * {
    margin-top: 5px;
  }

  .version-area {
    position: absolute;
    top: 0;
    right: 0;
    margin: 10px;
  }
`;

const fallbackGlobalSettings: IGlobalSettings = {
  useLocalResouces: false,
  useOnlineResources: false,
  localProjectRootFolderPath: '',
};

const uiScaleOptions: ISelectorOption[] = [
  0.7,
  0.8,
  0.9,
  1,
  1.1,
  1.2,
  1.3,
].map((val) => ({ label: `${(val * 100) >> 0}%`, value: val.toString() }));

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

  const appVersionInfo = useFetcher(
    ipcAgent.async.system_getApplicationVersionInfo,
    { version: '' },
  );

  return (
    <div css={cssUiSettingsPage}>
      <div>{texts.label_settings_pageTitle}</div>

      <Indent>
        <div>{texts.label_settings_header_resources}</div>
        <Indent>
          <CheckBoxLine
            text={texts.label_settings_configUseOnlineProjectResources}
            hint={texts.hint_settings_configUseOnlineProjectResources}
            checked={settings.useOnlineResources}
            setChecked={fieldSetter(settings, 'useOnlineResources')}
          />
          <CheckBoxLine
            text={texts.label_settings_configUseLocalProjectResources}
            hint={texts.hint_settings_configUseLocalProjectResources}
            checked={settings.useLocalResouces}
            setChecked={fieldSetter(settings, 'useLocalResouces')}
          />
          <div>
            <div>{texts.label_settings_configKermiteRootDirectory}</div>
            <HFlex>
              <GeneralInput
                value={folderPathDisplayValue}
                disabled={!canChangeFolder}
                readOnly={true}
                width={350}
                hint={texts.hint_settings_configKermiteRootDirectory}
              />
              <GeneralButton
                onClick={onSelectButton}
                disabled={!canChangeFolder}
                icon="folder_open"
                size="unitSquare"
              />
            </HFlex>
          </div>
          <CheckBoxLine
            text="Use KermiteServer Profiles"
            checked={uiStatusModel.settings.integrateUserPresetHub}
            setChecked={fieldSetter(
              uiStatusModel.settings,
              'integrateUserPresetHub',
            )}
          />
        </Indent>
        <div>{texts.label_settings_header_userInterface}</div>
        <Indent>
          <div>{texts.label_settings_configUiScaling}</div>
          <RibbonSelector
            options={uiScaleOptions}
            value={uiStatusModel.settings.siteDpiScale.toString()}
            setValue={(strVal) =>
              (uiStatusModel.settings.siteDpiScale = parseFloat(strVal))
            }
            hint={texts.hint_settings_configUiScaling}
          />
        </Indent>
      </Indent>

      <div className="version-area">
        application version: {appVersionInfo.version}
      </div>
    </div>
  );
};
