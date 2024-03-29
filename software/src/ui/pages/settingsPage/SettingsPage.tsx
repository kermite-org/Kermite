import { css, jsx } from 'alumina';
import { colors, texts } from '~/ui/base';
import {
  CheckBoxLine,
  GeneralButton,
  GeneralInput,
  HFlex,
  Indent,
  RibbonSelector,
} from '~/ui/components';
import { settingsPageStore } from '~/ui/store/domains/settingsPageStore';

export const SettingsPage = () => {
  const {
    readers: {
      flagDeveloperMode,
      flagUseLocalResources,
      flagAllowCrossKeyboardKeyMappingWrite,
      canChangeLocalRepositoryFolderPath,
      localRepositoryFolderPathDisplayValue,
      isLocalRepositoryFolderPathValid,
      uiScalingOptions,
      uiScalingSelectionValue,
      appVersionInfo,
      flagShowDevelopmentPackages,
    },
    actions: {
      setFlagDeveloperMode,
      setFlagUseLocalResources,
      setFlagAllowCrossKeyboardKeyMappingWrite,
      handleSelectLocalRepositoryFolder,
      setUiScalingSelectionValue,
      setFlagShowDevelopmentPackages,
      discardPageStorage,
    },
  } = settingsPageStore;

  return (
    <div class={style}>
      <div>{texts.settings.pageTitle}</div>

      <Indent>
        <div>{texts.settings.header_resources}</div>
        <Indent>
          <CheckBoxLine
            text="Developer Mode"
            checked={flagDeveloperMode}
            setChecked={setFlagDeveloperMode}
          />
          <Indent>
            <CheckBoxLine
              text={texts.settings.configUseLocalProjectResources}
              hint={texts.settingsHint.configUseLocalProjectResources}
              checked={flagUseLocalResources}
              setChecked={setFlagUseLocalResources}
              disabled={!flagDeveloperMode}
              if={false}
            />
            <div if={false}>
              <div
                class={!canChangeLocalRepositoryFolderPath && 'text-disabled'}
              >
                {texts.settings.configKermiteRootDirectory}
              </div>
              <HFlex>
                <GeneralInput
                  value={localRepositoryFolderPathDisplayValue}
                  disabled={!canChangeLocalRepositoryFolderPath}
                  readOnly={true}
                  width={350}
                  hint={texts.settingsHint.configKermiteRootDirectory}
                />
                <GeneralButton
                  onClick={handleSelectLocalRepositoryFolder}
                  disabled={!canChangeLocalRepositoryFolderPath}
                  icon="folder_open"
                  size="unitSquare"
                />
              </HFlex>
              <div style="color:red" if={!isLocalRepositoryFolderPathValid}>
                invalid source folder path
              </div>
            </div>
            <CheckBoxLine
              text="Allow Cross Keyboard Keymapping Write"
              checked={flagAllowCrossKeyboardKeyMappingWrite}
              setChecked={setFlagAllowCrossKeyboardKeyMappingWrite}
              disabled={!flagDeveloperMode}
            />
            <CheckBoxLine
              text="Show development packages"
              checked={flagShowDevelopmentPackages}
              setChecked={setFlagShowDevelopmentPackages}
              disabled={!flagDeveloperMode}
            />
          </Indent>
        </Indent>

        <div>{texts.settings.header_userInterface}</div>
        <Indent>
          <div>{texts.settings.configUiScaling}</div>
          <RibbonSelector
            options={uiScalingOptions}
            value={uiScalingSelectionValue}
            setValue={setUiScalingSelectionValue}
            hint={texts.settingsHint.configUiScaling}
          />
        </Indent>
      </Indent>
      <div>
        <button onClick={discardPageStorage}>保存データを破棄</button>
      </div>

      <div class="version-area" if={!!appVersionInfo}>
        application version: {appVersionInfo}
      </div>
    </div>
  );
};

const style = css`
  background: ${colors.clBackground};
  color: ${colors.clMainText};
  height: 100%;
  padding: 20px;
  position: relative;

  > * + * {
    margin-top: 10px;
  }

  .version-area {
    position: absolute;
    top: 0;
    right: 0;
    margin: 20px;
  }

  .text-disabled {
    opacity: 0.4;
  }
`;
