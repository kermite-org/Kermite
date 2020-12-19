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

const editor = new (class {
  get canUndo() {
    return false;
  }

  get canRedo() {
    return false;
  }

  undo = () => {};

  redo = () => {};

  changeCardXValue(cardIndex: number, x: number) {
    state.edit.cards[cardIndex].x = x;
    console.log(JSON.stringify(state.edit));
  }

  selectCard(cardIndex: number) {
    state.edit.cidx = cardIndex;
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
