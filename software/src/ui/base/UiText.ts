import { cloneObject, injectObjectPropsRecursive } from '~/shared';
import textSourceEnglish from '../i18n/en.json';
import textSourceJapanese from '../i18n/ja.json';

type ITextSource = typeof textSourceEnglish & typeof textSourceJapanese;

export type ILanguageKey = 'english' | 'japanese';

const textSources: { [key in ILanguageKey]: any } = {
  english: textSourceEnglish,
  japanese: textSourceJapanese,
};

export const uiTextConfigLoader = {
  loadLanguageKey(): ILanguageKey {
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

export const languageKey = uiTextConfigLoader.loadLanguageKey();

const activeTextSource = cloneObject(textSourceEnglish) as ITextSource;
injectObjectPropsRecursive(activeTextSource, textSources[languageKey]);

export const texts = activeTextSource;
