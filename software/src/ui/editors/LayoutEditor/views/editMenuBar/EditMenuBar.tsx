import { jsx, css, FC } from 'qx';
import {
  GeneralButton,
  GeneralSelector,
  RibbonSelector,
  ToggleButton,
} from '~/ui/components';
import { makeEditMenuBarViewModel } from '~/ui/editors/LayoutEditor/views/editMenuBar/EditMenuBar.model';

export const EditMenuBar: FC = () => {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    editModeVm,
    vmShowAxis,
    vmShowGrid,
    vmSnapToGrid,
    vmSnapDivision,
    resetKeyboardDesign,
    vmShowKeyId,
    vmShowKeyIndex,
  } = makeEditMenuBarViewModel();

  return (
    <div class={style}>
      <RibbonSelector
        options={editModeVm.options}
        value={editModeVm.value}
        setValue={editModeVm.setValue}
        buttonWidth={55}
      />

      <div class="buttonsBox">
        <GeneralButton disabled={!canUndo} onClick={undo} icon="fa fa-undo" />
        <GeneralButton disabled={!canRedo} onClick={redo} icon="fa fa-redo" />
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

      <div class="buttonsBox" qxIf={false}>
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

      <div qxIf={false}>
        <GeneralButton onClick={resetKeyboardDesign} text="reset" />
      </div>
    </div>
  );
};

const style = css`
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
  button {
    width: 50px;
    padding: 5px;
    cursor: pointer;
    user-select: none;
  }
`;
