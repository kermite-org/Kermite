import { css, FC, jsx } from 'alumina';
import { colors, texts } from '~/ui/base';
import { CheckBoxLine } from '~/ui/components';
import { WelcomePageButton } from '~/ui/components/atoms';
import { ToggleSwitchLine } from '~/ui/components/molecules/ToggleSwitchLine';
import { welcomePageStore } from '~/ui/store/domains/welcomePageStore';

export const WelcomePage: FC = () => {
  const {
    readers: {
      appVersion,
      isLanguageEnglish,
      isLanguageJapanese,
      isDarkTheme,
      isDeveloperMode,
      isHidSupported,
    },
    actions: {
      setLanguageEnglish,
      setLanguageJapanese,
      showProfileSetupWizard,
      setDarkTheme,
      showProjectQuickSetupWizard,
      setDeveloperMode,
    },
  } = welcomePageStore;

  return (
    <div class={style}>
      <h1>Kermite</h1>
      <h2>Keyboard Ecosystem All in One</h2>
      <div class="buttons-panel">
        <div class="row">
          <WelcomePageButton
            class="button"
            active={isLanguageEnglish}
            onClick={setLanguageEnglish}
            hint={texts.welcomePageHint.language_english}
          >
            {texts.welcomePage.language_english}
          </WelcomePageButton>
          <WelcomePageButton
            class="button"
            active={isLanguageJapanese}
            onClick={setLanguageJapanese}
            hint={texts.welcomePageHint.language_japanese}
          >
            {texts.welcomePage.language_japanese}
          </WelcomePageButton>
        </div>
        <div class="row">
          <WelcomePageButton
            class="button"
            onClick={showProfileSetupWizard}
            hint={texts.welcomePageHint.profileSetupWizardButton}
          >
            {texts.welcomePage.profileSetupWizardButton}
          </WelcomePageButton>
        </div>
        <div class="row">
          <WelcomePageButton
            class="button"
            onClick={showProjectQuickSetupWizard}
            hint={texts.welcomePageHint.projectQuickSetupWizardButton}
            if={isDeveloperMode}
          >
            {texts.welcomePage.projectQuickSetupWizardButton}
          </WelcomePageButton>
        </div>
      </div>
      <div class="compatibility-message-area" if={!isHidSupported}>
        ブラウザがWebHIDに対応していないため、デバイスとの通信ができません。
        <br />
        WebHIDをサポートしている、Google Chromeでの利用を推奨しています。
      </div>
      <div class="theme-config-area">
        <ToggleSwitchLine
          text={texts.welcomePage.darkThemeOption}
          checked={isDarkTheme}
          onChange={setDarkTheme}
          hint={texts.welcomePageHint.darkThemeOption}
        />
      </div>
      <div class="developer-mode-option-area">
        <CheckBoxLine
          text={texts.welcomePage.developerModeOption}
          checked={isDeveloperMode}
          setChecked={setDeveloperMode}
          hint={texts.welcomePageHint.developerModeOption}
        />
      </div>
      <div class="version-area" if={!!appVersion}>
        {texts.welcomePage.version}: {appVersion}
      </div>
    </div>
  );
};

const style = css`
  background: ${colors.clBackground};
  color: ${colors.clMainText};
  height: 100%;
  padding: 10px;

  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  color: #469;
  padding-bottom: 30px;

  > h1 {
    font-size: 56px;
    font-weight: normal;
  }

  > h2 {
    margin-top: 15px;
    font-size: 28px;
    font-weight: normal;
  }

  > .buttons-panel {
    margin-top: 60px;
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    > .row {
      width: 100%;
      display: flex;
      justify-content: center;
      gap: 20px;

      > .button {
        width: 100%;
      }
    }
  }

  > .compatibility-message-area {
    position: absolute;
    top: 0;
    left: 0;
    margin: 10px;
  }

  > .theme-config-area {
    position: absolute;
    top: 0;
    right: 0;
    margin: 5px 10px;
  }

  > .developer-mode-option-area {
    position: absolute;
    bottom: 0;
    margin: 5px;
  }

  > .version-area {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 5px;
  }
`;
