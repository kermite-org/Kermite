import { useMemo } from 'qx';
import { ILanguageKey, uiTextConfigLoader } from '~/ui/base';
import { dispatchCoreAction } from '~/ui/store/base';

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
      dispatchCoreAction({ window_reloadPage: 1 });
    }
  };
  return { currentLanguage, changeLanguage };
}
