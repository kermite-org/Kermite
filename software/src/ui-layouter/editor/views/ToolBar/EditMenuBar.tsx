import { css } from 'goober';
import { h } from 'qx';
import { GeneralSelector, ToggleButton } from '~/ui-common/components';
import { ExclusiveButtonGroup } from '~/ui-layouter/controls';
import { makeEditMenuBarViewModel } from '~/ui-layouter/editor/views/ToolBar/EditMenuBar.model';

const cssEditMenuBar = css`
  display: flex;
  flex-wrap: wrap;

  > * + * {
    margin-left: 40px;
  }

  > .buttonsBox {
    display: flex;
    > * + * {
      margin-left: 5px;
    }
  }

  > .spacer {
    flex-grow: 1;
    margin-left: 0;
  }

  button {
    width: 50px;
    padding: 5px;
    cursor: pointer;
    user-select: none;
  }
`;

export const EditMenuBar = () => {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    editorTargetVm,
    editModeVm,
    vmShowAxis,
    vmShowGrid,
    vmSnapToGrid,
    vmSnapDivision,
    vmShowConfig,
    canSelectEditMode,
    resetKeyboardDesign,
    vmShowKeyId,
    vmShowKeyIndex,
  } = makeEditMenuBarViewModel();

  return (
    <div class={cssEditMenuBar}>
      <ExclusiveButtonGroup
        options={editorTargetVm.options}
        value={editorTargetVm.value}
        setValue={editorTargetVm.setValue}
        buttonWidth={55}
      />

      <ExclusiveButtonGroup
        options={editModeVm.options}
        value={editModeVm.value}
        setValue={editModeVm.setValue}
        buttonWidth={55}
        disabled={!canSelectEditMode}
      />

      <div class="buttonsBox">
        <button disabled={!canUndo} onClick={undo}>
          undo
        </button>
        <button disabled={!canRedo} onClick={redo}>
          redo
        </button>
      </div>

      <div class="buttonsBox">
        <ToggleButton
          text="axis"
          width={45}
          active={vmShowAxis.active}
          setActive={vmShowAxis.setActive}
        />
        <ToggleButton
          text="grid"
          width={45}
          active={vmShowGrid.active}
          setActive={vmShowGrid.setActive}
        />
        <ToggleButton
          text="snap"
          width={45}
          active={vmSnapToGrid.active}
          setActive={vmSnapToGrid.setActive}
        />

        <GeneralSelector
          options={vmSnapDivision.options}
          value={vmSnapDivision.value}
          setValue={vmSnapDivision.setValue}
        />
      </div>

      <div class="buttonsBox">
        <ToggleButton
          text="id"
          width={45}
          active={vmShowKeyId.active}
          setActive={vmShowKeyId.setActive}
        />
        <ToggleButton
          text="index"
          width={45}
          active={vmShowKeyIndex.active}
          setActive={vmShowKeyIndex.setActive}
        />
      </div>

      <div>
        <button onClick={resetKeyboardDesign}>reset</button>
      </div>

      <div class="spacer" />

      <div>
        <ToggleButton
          text="config"
          width={60}
          active={vmShowConfig.active}
          setActive={vmShowConfig.setActive}
        />
      </div>
    </div>
  );
};
