import { cloneObject, copyObjectPropsRecursive } from '~/shared';
import textSourceEnglish from '../i18n/en.json';
import textSourceJapanese from '../i18n/ja.json';

type ITextSource = typeof textSourceEnglish;

export type ILanguageKey = 'english' | 'japanese';

const textSources: { [key in ILanguageKey]: ITextSource } = {
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

const activeTextSource = cloneObject(textSourceEnglish);
copyObjectPropsRecursive(activeTextSource, textSources[languageKey]);

export const texts = activeTextSource;
