/* eslint-disable react/prop-types */
import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { appDomain } from '~ui2/models/zAppDomain';
import {
  IKeyboardLayoutStandard,
  IKeyboardBehaviorMode
} from '~defs/ConfigTypes';

interface IDualItemsHoverSelectorProps<T extends string> {
  items: T[];
  currentItem: T;
  setCurrentItem: (nextItem: T) => void;
  textDictionary: { [key in T]: string };
}

function DualItemsHoverSelector<T extends string>(
  props: IDualItemsHoverSelectorProps<T>
) {
  let isHover = false;
  const onMouseEnter = () => (isHover = true);
  const onMouseLeave = () => (isHover = false);

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
  return (props: IDualItemsHoverSelectorProps<T>) => {
    const { items, currentItem, setCurrentItem, textDictionary } = props;
    return (
      <div
        css={cssDualItemsSelector}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {!isHover && <div class="fixedView">{textDictionary[currentItem]}</div>}
        {isHover && (
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
  };
}

export const BehaviorSelector = () => {
  const { keyboardConfigModel } = appDomain;
  const modes: IKeyboardBehaviorMode[] = ['Standalone', 'SideBrain'];
  const currentMode = keyboardConfigModel.behaviorMode;
  const setCurrent = (mode: IKeyboardBehaviorMode) => {
    keyboardConfigModel.behaviorMode = mode;
  };
  const textDictionary: { [key in IKeyboardBehaviorMode]: string } = {
    Standalone: 'STD',
    SideBrain: 'SB'
  };

  return (
    <DualItemsHoverSelector
      items={modes}
      currentItem={currentMode}
      setCurrentItem={setCurrent}
      textDictionary={textDictionary}
    />
  );
};

export const LayoutStandardSelector = () => {
  const { keyboardConfigModel } = appDomain;
  const layouts: IKeyboardLayoutStandard[] = ['US', 'JIS'];
  const currentLayout = keyboardConfigModel.layoutStandard;
  const setCurrent = (layout: IKeyboardLayoutStandard) => {
    keyboardConfigModel.layoutStandard = layout;
  };
  const textDictionary: { [key in IKeyboardLayoutStandard]: string } = {
    US: 'US',
    JIS: 'JIS'
  };
  return (
    <DualItemsHoverSelector
      items={layouts}
      currentItem={currentLayout}
      setCurrentItem={setCurrent}
      textDictionary={textDictionary}
    />
  );
};
