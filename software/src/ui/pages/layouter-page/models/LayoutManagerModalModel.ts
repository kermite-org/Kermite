import {
  ILayoutManagerModalState,
  layoutManagerState,
} from '~/ui/pages/layouter-page/models/LayoutManagerBase';

const setModalState = (state: ILayoutManagerModalState) => {
  layoutManagerState.modalState = state;
};

export const layoutManagerModalModel = {
  get modalState(): ILayoutManagerModalState {
    return layoutManagerState.modalState;
  },
  openLoadFromProjectModal: () => setModalState('LoadFromProject'),
  openSaveToProjectModal: () => setModalState('SaveToProject'),
  closeModal: () => setModalState('None'),
};
