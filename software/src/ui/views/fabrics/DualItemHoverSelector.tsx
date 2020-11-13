import { css } from 'goober';
import { h, Hook } from '~lib/qx';

interface IDualItemsHoverSelectorProps<T extends string> {
  items: T[];
  currentItem: T;
  setCurrentItem: (nextItem: T) => void;
  textDictionary: { [key in T]: string };
}

const cssDualItemsSelector = css`
  width: 36px;
  user-select: none;
  > .fixedView {
    text-align: center;
    cursor: pointer;
  }

  > .selectable {
    display: flex;
    flex-direction: column;
    align-items: center;

    > div {
      cursor: pointer;
      opacity: 0.5;

      &[data-current] {
        opacity: 1;
      }
    }
  }
`;

export function DualItemsHoverSelector<T extends string>(
  props: IDualItemsHoverSelectorProps<T>
) {
  const state = Hook.useLocal(() => ({ isHover: false }));
  const onMouseEnter = () => (state.isHover = true);
  const onMouseLeave = () => (state.isHover = false);

  const { items, currentItem, setCurrentItem, textDictionary } = props;
  return (
    <div
      css={cssDualItemsSelector}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!state.isHover && (
        <div class="fixedView">{textDictionary[currentItem]}</div>
      )}
      {state.isHover && (
        <div class="selectable">
          {items.map((it) => (
            <div
              key={it}
              data-current={currentItem === it}
              onClick={() => setCurrentItem(it)}
            >
              {textDictionary[it]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
