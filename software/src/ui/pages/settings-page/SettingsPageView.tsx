import { css, jsx } from 'qx';
import { texts, uiTheme } from '~/ui/base';
import {
  CheckBoxLine,
  GeneralButton,
  GeneralInput,
  HFlex,
  Indent,
  RibbonSelector,
} from '~/ui/components';
import { useSettingsPageModel } from '~/ui/pages/settings-page/SettingsPageModel';

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
              qxIf={false}
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
