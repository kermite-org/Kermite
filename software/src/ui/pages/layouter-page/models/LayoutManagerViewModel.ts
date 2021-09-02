import {
  ILayoutManagerModalState,
  layoutManagerState,
} from '~/ui/pages/layouter-page/models/LayoutManagerBase';

export type ILayoutManagerEditTargetRadioSelection =
  | 'CurrentProfile'
  | 'LayoutFile';
export interface ILayoutManagerViewModel {
  modalState: ILayoutManagerModalState;
  openLoadFromProjectModal(): void;
  openSaveToProjectModal(): void;
  closeModal(): void;
}

function useLayoutManagerViewModelImpl(): ILayoutManagerViewModel {
  const { modalState } = layoutManagerState;
  const setModalState = (state: ILayoutManagerModalState) => {
    layoutManagerState.modalState = state;
  };

  return {
    modalState,
    openLoadFromProjectModal: () => setModalState('LoadFromProject'),
    openSaveToProjectModal: () => setModalState('SaveToProject'),
    closeModal: () => setModalState('None'),
  };
}

export function useLayoutManagerViewModel(): ILayoutManagerViewModel {
  return useLayoutManagerViewModelImpl();
}
