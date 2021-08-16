import { useMemo } from 'qx';
import { ILanguageKey, ipcAgent, uiTextConfigLoader } from '~/ui/base';

export interface ILanguageSelectionModel {
  currentLanguage: ILanguageKey;
  changeLanguage(languageKey: ILanguageKey): void;
}

export function useLanguageSelectionModel(): ILanguageSelectionModel {
  const currentLanguage = useMemo(
    () => uiTextConfigLoader.loadLanguageKey(),
    [],
  );
  const changeLanguage = (languageKey: ILanguageKey) => {
    if (languageKey !== currentLanguage) {
      uiTextConfigLoader.saveLanguageKey(languageKey);
      ipcAgent.async.window_reloadPage();
    }
  };
  return { currentLanguage, changeLanguage };
}
