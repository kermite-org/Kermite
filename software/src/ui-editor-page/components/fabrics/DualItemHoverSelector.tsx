import { jsx, css } from 'qx';

interface IDualItemsHoverSelectorProps<T extends string> {
  items: T[];
  currentItem: T;
  setCurrentItem: (nextItem: T) => void;
  textDictionary: { [key in T]: string };
  hint?: string;
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

  &:hover > .fixedView {
    display: none;
  }

  &:not(:hover) > .selectable {
    display: none;
  }
`;

export function DualItemsHoverSelector<T extends string>(
  props: IDualItemsHoverSelectorProps<T>,
) {
  const { items, currentItem, setCurrentItem, textDictionary } = props;
  return (
    <div css={cssDualItemsSelector} data-hint={props.hint}>
      <div class="fixedView">{textDictionary[currentItem]}</div>
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
    </div>
  );
}
