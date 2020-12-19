import { produce } from 'immer';

interface ICard {
  x: number;
}

const initialCards: ICard[] = [{ x: 0 }, { x: 0 }, { x: 0 }];

interface IEditState {
  cards: ICard[];
  cidx: number;
}

interface IState {
  edit: IEditState;
}

const state: IState = {
  edit: {
    cards: initialCards,
    cidx: 0,
  },
};

interface IModification {
  oldState: IEditState;
  newState: IEditState;
}

function stringifyEditState(editState: IEditState) {
  return `${editState.cards.map((c) => c.x).join('-')}$${editState.cidx}`;
}

function stringifyModification(modification: IModification) {
  return `${stringifyEditState(modification.oldState)} --> ${stringifyEditState(
    modification.newState
  )}`;
}

const editor = new (class {
  private undoStack: IModification[] = [];
  private redoStack: IModification[] = [];

  get canUndo() {
    return this.undoStack.length > 0;
  }

  get canRedo() {
    return this.redoStack.length > 0;
  }

  private dumpStacks() {
    console.log(
      JSON.stringify(
        {
          undoStack: this.undoStack.map(stringifyModification),
          current: stringifyEditState(state.edit),
          redoStack: this.redoStack.map(stringifyModification),
        },
        null,
        ' '
      )
    );
  }

  undo = () => {
    if (this.undoStack.length > 0) {
      const modification = this.undoStack.pop()!;
      this.redoStack.push(modification);
      state.edit = modification.oldState;
      console.log('undo');
      this.dumpStacks();
    }
  };

  redo = () => {
    if (this.redoStack.length > 0) {
      const modificatin = this.redoStack.pop()!;
      this.undoStack.push(modificatin);
      state.edit = modificatin.newState;
      console.log('redo');
      this.dumpStacks();
    }
  };

  changeCardXValue(cardIndex: number, x: number) {
    const oldState = state.edit;
    const newState = produce(state.edit, (draft) => {
      draft.cards[cardIndex].x = x;
    });
    state.edit = newState;

    this.undoStack.push({ oldState, newState });
    this.redoStack = [];

    console.log('edit');
    this.dumpStacks();
  }

  selectCard(cardIndex: number) {
    state.edit = produce(state.edit, (draft) => {
      draft.cidx = cardIndex;
    });
  }
})();

interface IEditorViewModel {
  cards: {
    index: number;
    isSelected: boolean;
    setSelected(): void;
    dots: {
      isActive: boolean;
      handleSelect(): void;
    }[];
  }[];
  canUndo: boolean;
  canRedo: boolean;
  undo(): void;
  redo(): void;
}

export function createEditorViewModel(): IEditorViewModel {
  return {
    cards: state.edit.cards.map((card, cardIndex) => ({
      index: cardIndex,
      isSelected: cardIndex === state.edit.cidx,
      setSelected: () => editor.selectCard(cardIndex),
      dots: [0, 1, 2, 3, 4].map((x) => ({
        isActive: x === card.x,
        handleSelect: () => {
          if (cardIndex === state.edit.cidx) {
            editor.changeCardXValue(cardIndex, x);
          }
        },
      })),
    })),
    canUndo: editor.canUndo,
    canRedo: editor.canRedo,
    undo: editor.undo,
    redo: editor.redo,
  };
}
