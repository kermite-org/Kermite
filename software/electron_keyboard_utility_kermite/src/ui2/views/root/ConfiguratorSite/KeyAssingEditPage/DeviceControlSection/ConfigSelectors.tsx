/* eslint-disable react/prop-types */
import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { appDomain } from '~ui2/models/zAppDomain';
import { IKeyboardLanguage, IKeyboardBehaviorMode } from '~defs/ConfigTypes';

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
    width: 30px;
    user-select: none;
    > .fixedView {
      cursor: pointer;
    }

    > .selectable {
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

export const LangSelector = () => {
  const { keyboardConfigModel } = appDomain;
  const langs: IKeyboardLanguage[] = ['US', 'JP'];
  const currentLang = keyboardConfigModel.keyboardLanguage;
  const setCurrent = (lang: IKeyboardLanguage) => {
    keyboardConfigModel.keyboardLanguage = lang;
  };
  const textDictionary: { [key in IKeyboardLanguage]: string } = {
    US: 'US',
    JP: 'JP'
  };
  return (
    <DualItemsHoverSelector
      key="A"
      items={langs}
      currentItem={currentLang}
      setCurrentItem={setCurrent}
      textDictionary={textDictionary}
    />
  );
};
