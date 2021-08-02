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
import { useFetcher, fieldSetter } from '~/ui/helpers';

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
    fixedProjectRootPath: '',
  });

  useEffect(() => {
    (async () => {
      if (appUi.isDevelopment) {
        local.fixedProjectRootPath = await ipcAgent.async.config_getProjectRootDirectoryPath();
      }
    })();
    return () => globalSettingsModel.save();
  }, []);

  const { globalSettings } = globalSettingsModel;

  const onSelectButton = async () => {
    const path = await ipcAgent.async.file_getOpenDirectoryWithDialog();
    if (path) {
      globalSettings.localProjectRootFolderPath = path;
    }
  };

  const canChangeFolder = !appUi.isDevelopment;

  const folderPathDisplayValue =
    local.fixedProjectRootPath || globalSettings.localProjectRootFolderPath;

  const appVersionInfo = useFetcher(
    ipcAgent.async.system_getApplicationVersionInfo,
    { version: '' },
  );

  return (
    <div css={style}>
      <div>{texts.label_settings_pageTitle}</div>

      <Indent>
        <div>{texts.label_settings_header_resources}</div>
        <Indent>
          <CheckBoxLine
            text="Developer Mode"
            checked={globalSettings.developerMode}
            setChecked={fieldSetter(globalSettings, 'developerMode')}
          />
          <CheckBoxLine
            text={texts.label_settings_configUseLocalProjectResources}
            hint={texts.hint_settings_configUseLocalProjectResources}
            checked={globalSettings.useLocalResouces}
            setChecked={fieldSetter(globalSettings, 'useLocalResouces')}
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
        </Indent>
        <div>Application Behavior</div>
        <Indent>
          <CheckBoxLine
            text="Allow Cross Keyboard Keymapping Write"
            checked={globalSettings.allowCrossKeyboardKeyMappingWrite}
            setChecked={fieldSetter(
              globalSettings,
              'allowCrossKeyboardKeyMappingWrite',
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

      <div className="version-area" qxIf={!!appVersionInfo.version}>
        application version: {appVersionInfo.version}
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
    margin-top: 5px;
  }

  .version-area {
    position: absolute;
    top: 0;
    right: 0;
    margin: 10px;
  }
`;
