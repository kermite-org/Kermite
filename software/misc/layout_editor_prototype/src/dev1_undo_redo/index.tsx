/* eslint-disable react/jsx-key */
import { css } from 'goober';
import { h, render } from '~/qx';
import { createEditorViewModel } from './index.model';

const cssCard = css`
  display: flex;
  padding: 10px;
  padding-right: 40px;
  border: solid 1px #888;
  cursor: pointer;

  > * + * {
    margin-left: 10px;
  }

  > .flag {
    background: #00f;
    color: #fff;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  > .dot {
    width: 20px;
    height: 20px;
    border: solid 1px #08f;
    border-radius: 50%;
    cursor: pointer;

    &[data-active] {
      background: #4df;
    }
  }

  &[data-selected] {
    background: #cfc;
  }
`;

const cssPageRoot = css`
  > .buttonsRow {
    > * + * {
      margin-left: 5px;
    }
    > button {
      width: 60px;
      padding: 5px;
      cursor: pointer;
    }
  }

  > .editRow {
    display: inline-block;
    margin-top: 10px;
  }
`;

const PageRoot = () => {
  const vm = createEditorViewModel();
  return (
    <div css={cssPageRoot}>
      <div class="buttonsRow">
        <button disabled={!vm.canUndo} onClick={vm.undo}>
          undo
        </button>
        <button disabled={!vm.canRedo} onClick={vm.redo}>
          redo
        </button>
      </div>
      <div class="editRow">
        {vm.cards.map((card) => {
          return (
            <div
              css={cssCard}
              onClick={card.setSelected}
              data-selected={card.isSelected}
            >
              <div class="flag">{card.index}</div>
              {card.dots.map((dot, index) => (
                <div
                  class="dot"
                  data-active={dot.isActive}
                  key={index}
                  onClick={(e) => {
                    dot.handleSelect();
                    e.stopPropagation();
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

window.addEventListener('load', () => {
  render(() => <PageRoot />, document.getElementById('app2'));
});
