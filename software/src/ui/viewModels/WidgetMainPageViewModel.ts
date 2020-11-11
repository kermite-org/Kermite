import { models } from '~ui/models';
import { makeKeyUnitCardsPartViewModel } from '~ui/viewModels/KeyUnitCardsPartViewModel';

export function makeWidgetMainPageViewModel() {
  return {
    isWindowActive: models.siteModel.isWindowActive,
    keyboardVM: {
      keyboardShape: models.editorModel.profileData.keyboardShape,
      cardsPartVM: makeKeyUnitCardsPartViewModel(false, models)
    },
    onOpenButton() {
      models.siteModel.setWidgetMode(false);
    }
  };
}
