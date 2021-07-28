import { jsx, css, useLocal, useEffect } from 'qx';
import { globalSettingsFallbackValue } from '~/shared';
import {
  uiTheme,
  ISelectorOption,
  ipcAgent,
  appUi,
  texts,
} from '~/ui/common/base';
import {
  Indent,
  CheckBoxLine,
  HFlex,
  GeneralInput,
  GeneralButton,
  RibbonSelector,
} from '~/ui/common/components';
import { useFetcher, fieldSetter } from '~/ui/common/helpers';
import { uiStatusModel } from '~/ui/common/sharedModels';

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
    settings: globalSettingsFallbackValue,
    fixedProjectRootPath: '',
  });

  useEffect(() => {
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
        </Indent>
        <div>Application Behavior</div>
        <Indent>
          <CheckBoxLine
            text="Allow Cross Keyboard Keymapping Write"
            checked={settings.allowCrossKeyboardKeyMappingWrite}
            setChecked={fieldSetter(
              settings,
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
