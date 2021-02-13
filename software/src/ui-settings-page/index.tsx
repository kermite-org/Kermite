import { css } from 'goober';
import { h, Hook } from 'qx';
import { IGlobalSettings } from '~/shared';
import {
  appUi,
  fieldSetter,
  ipcAgent,
  ISelectorOption,
  uiTheme,
  useLocal,
} from '~/ui-common';
import {
  CheckBoxLine,
  GeneralButton,
  GeneralInput,
  HFlex,
  Indent,
  RibbonSelector,
} from '~/ui-common/components';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';

const cssUiSettingsPage = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 10px;

  > * + * {
    margin-top: 5px;
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

  return (
    <div css={cssUiSettingsPage}>
      <div>Configurations</div>

      <Indent>
        <div>Resources</div>
        <Indent>
          <CheckBoxLine
            text="Use Online Project Resources"
            checked={settings.useOnlineResources}
            setChecked={fieldSetter(settings, 'useOnlineResources')}
          />
          <CheckBoxLine
            text="Use Local Project Resources"
            checked={settings.useLocalResouces}
            setChecked={fieldSetter(settings, 'useLocalResouces')}
          />
          <div>
            <div>Kermite Root Directory</div>
            <HFlex>
              <GeneralInput
                value={folderPathDisplayValue}
                disabled={!canChangeFolder}
                readOnly={true}
                width={350}
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
        <div>User Interface</div>
        <Indent>
          <div>UI Scaling</div>
          <RibbonSelector
            options={uiScaleOptions}
            value={uiStatusModel.settings.siteDpiScale.toString()}
            setValue={(strVal) =>
              (uiStatusModel.settings.siteDpiScale = parseFloat(strVal))
            }
          />
        </Indent>
      </Indent>
    </div>
  );
};
