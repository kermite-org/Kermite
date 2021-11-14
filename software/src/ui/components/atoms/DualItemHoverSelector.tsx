import { jsx, css } from 'alumina';

interface Props<T extends string | number> {
  items: T[];
  currentItem: T;
  setCurrentItem: (nextItem: T) => void;
  textDictionary: { [key in T]: string };
  hint?: string;
  disabled?: boolean;
}

export function DualItemsHoverSelector<T extends string | number>({
  items,
  currentItem,
  setCurrentItem,
  textDictionary,
  hint,
  disabled,
}: Props<T>) {
  return (
    <div
      css={style}
      data-hint={hint}
      className={(disabled && '--disabled') || ''}
    >
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

const style = css`
  width: 36px;
  user-select: none;
  > .fixedView {
    text-align: center;
    cursor: pointer;
  }

  &.--disabled {
    opacity: 0.5;
    pointer-events: none;
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
