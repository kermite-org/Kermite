export const textSourceEnglish = {
  hintSwitchToWidgetView: 'Switch to widget view',
  hintMinimizeWindow: 'Minimize window',
  hintMaximizeWindow: 'Maximize window',
  hintCloseApplication: 'Close application',
};

export const textSourceJapanese: ITextSource = {
  hintSwitchToWidgetView: 'ウィジェット表示に切り替えます。',
  hintMinimizeWindow: 'ウインドウを最小化します。',
  hintMaximizeWindow: 'ウインドウを最大化します。',
  hintCloseApplication: 'アプリケーションを終了します。',
};

type ITextSource = { [key in keyof typeof textSourceEnglish]: string };

export type ILanguageKey = 'english' | 'japanese';

const textSources: { [key in ILanguageKey]: ITextSource } = {
  english: textSourceEnglish,
  japanese: textSourceJapanese,
};

export const uiTextConfigLoader = {
  loadLanugageKey(): ILanguageKey {
    const languageKey = localStorage.getItem('languageKey') as ILanguageKey;
    if (Object.keys(textSources).includes(languageKey)) {
      return languageKey;
    }
    return 'english';
  },
  saveLanguageKey(languageKey: ILanguageKey) {
    localStorage.setItem('languageKey', languageKey);
  },
};

export const texts = textSources[uiTextConfigLoader.loadLanugageKey()];
