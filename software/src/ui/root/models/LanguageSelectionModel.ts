import { useMemo } from 'qx';
import { ILanguageKey, ipcAgent, uiTextConfigLoader } from '~/ui/common/base';

export interface ILanguageSelectionModel {
  currrentLanguage: ILanguageKey;
  changeLanguage(languageKey: ILanguageKey): void;
}

export function useLanguageSelectionModel(): ILanguageSelectionModel {
  const currrentLanguage = useMemo(
    () => uiTextConfigLoader.loadLanugageKey(),
    [],
  );
  const changeLanguage = (languageKey: ILanguageKey) => {
    if (languageKey !== currrentLanguage) {
      uiTextConfigLoader.saveLanguageKey(languageKey);
      ipcAgent.async.window_reloadPage();
    }
  };
  return { currrentLanguage, changeLanguage };
}
