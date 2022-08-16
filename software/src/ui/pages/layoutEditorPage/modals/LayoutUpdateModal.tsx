import { css, FC, jsx, useLocal } from 'alumina';
import {
  createFallbackDisplayKeyboardDesign,
  getDisplayKeyboardDesignSingleCached,
  IDisplayKeyboardDesign,
  IProjectLayoutEntry,
} from '~/shared';
import { makePlainSelectorOption } from '~/ui/base';
import { GeneralSelector } from '~/ui/components';
import {
  ClosableOverlay,
  CommonDialogFrame,
  DialogButton,
} from '~/ui/components/modals';
import { ProjectKeyboardShapeView } from '~/ui/elements';
import { LayoutEditorCore } from '~/ui/featureEditors';
import { uiReaders } from '~/ui/store';
import { layoutManagerActions } from '../models/layoutManagerActions';

type ILayoutSelectionItem = {
  selectionLabel: string;
  layout: IProjectLayoutEntry;
};

function createLayoutUpdateModalModel() {
  const { globalProjectId, allProjectPackageInfos } = uiReaders;
  const sourceProjectInfos = allProjectPackageInfos.filter(
    (info) => info.projectId === globalProjectId,
  );
  const layoutSelectionItems = sourceProjectInfos
    ?.map((info) =>
      info.layouts.map((layout) => {
        const prefix = info.origin !== 'online' ? `(${info.origin})` : '';
        const selectionLabel = `${prefix}${layout.layoutName}`;
        return { selectionLabel, layout };
      }),
    )
    .flat() as ILayoutSelectionItem[];

  const itemOptions = layoutSelectionItems.map((item) =>
    makePlainSelectorOption(item.selectionLabel),
  );

  const fallbackKeyboardDesign = createFallbackDisplayKeyboardDesign();

  const state = {
    currentItemKey: layoutSelectionItems[0]?.selectionLabel || '',
  };

  const readers = {
    itemOptions,
    get currentItemKey(): string {
      return state.currentItemKey;
    },
    get currentItem(): ILayoutSelectionItem | undefined {
      return layoutSelectionItems.find(
        (it) => it.selectionLabel === state.currentItemKey,
      );
    },
    get currentItemPreviewLayoutData(): IDisplayKeyboardDesign {
      const item = readers.currentItem;
      if (item) {
        return getDisplayKeyboardDesignSingleCached(item.layout.data);
      }
      return fallbackKeyboardDesign;
    },
  };

  const actions = {
    setCurrentItemKey(value: string) {
      state.currentItemKey = value;
    },
    handleApply() {
      const item = readers.currentItem;
      if (item) {
        LayoutEditorCore.replaceKeyboardDesign(item.layout.data);
      }
      layoutManagerActions.closeModal();
    },
    handleClose() {
      layoutManagerActions.closeModal();
    },
  };

  return {
    readers,
    actions,
  };
}

export const LayoutUpdateModal: FC = () => {
  const modalTitle = 'Copy From Project Layout';

  const {
    readers: { itemOptions, currentItemKey, currentItemPreviewLayoutData },
    actions: { setCurrentItemKey, handleApply, handleClose },
  } = useLocal(createLayoutUpdateModalModel);

  return (
    <ClosableOverlay close={handleClose}>
      <CommonDialogFrame caption={modalTitle} close={handleClose}>
        <div class={cssPanelContent}>
          <GeneralSelector
            options={itemOptions}
            value={currentItemKey}
            setValue={setCurrentItemKey}
            class="selector"
          />
          <div class="shape-preview-row">
            <ProjectKeyboardShapeView
              keyboardDesign={currentItemPreviewLayoutData}
            />
          </div>
          <div class="buttons-row">
            <DialogButton onClick={handleApply}>Apply</DialogButton>
          </div>
        </div>
      </CommonDialogFrame>
    </ClosableOverlay>
  );
};

const cssPanelContent = css`
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  > .selector {
    width: 200px;
  }

  > .shape-preview-row {
    width: 360px;
    height: 120px;
  }

  > .buttons-row {
    display: flex;
    justify-content: flex-end;
  }
`;
