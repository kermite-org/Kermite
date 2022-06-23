import { ILanguageKey, uiTextConfigLoader } from '~/ui/base';
import { dispatchCoreAction } from '~/ui/store/base';

interface ILanguageSelectionStore {
  currentLanguage: ILanguageKey;
  changeLanguage(languageKey: ILanguageKey): void;
}

function createLanguageSelectionStore(): ILanguageSelectionStore {
  const currentLanguage = uiTextConfigLoader.loadLanguageKey();
  const changeLanguage = (languageKey: ILanguageKey) => {
    if (languageKey !== currentLanguage) {
      uiTextConfigLoader.saveLanguageKey(languageKey);
      dispatchCoreAction({ window_reloadPage: 1 });
    }
  };
  return { currentLanguage, changeLanguage };
}

export const languageSelectionStore = createLanguageSelectionStore();
