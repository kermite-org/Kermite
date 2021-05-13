import { jsx } from 'qx';
import { IKeyboardBehaviorMode } from '~/shared';
import { texts } from '~/ui/common';
import { useKeyboardBehaviorModeModel } from '~/ui/common/sharedModels/KeyboardBehaviorModeModel';
import { useSystemLayoutModel } from '~/ui/common/sharedModels/SystemLayoutModel';
import { DualItemsHoverSelector } from '~/ui/editor-page/components/fabrics/DualItemHoverSelector';

export const BehaviorSelector = () => {
  const modes: IKeyboardBehaviorMode[] = ['Standalone', 'Simulator'];
  const { behaviorMode, setBehaviorMode } = useKeyboardBehaviorModeModel();
  const textDictionary: { [key in IKeyboardBehaviorMode]: string } = {
    Standalone: 'STD',
    Simulator: 'SIM',
  };
  return (
    <DualItemsHoverSelector
      items={modes}
      currentItem={behaviorMode}
      setCurrentItem={setBehaviorMode}
      textDictionary={textDictionary}
      hint={texts.hint_assigner_topBar_keyboardBehaviorModeSelector}
    />
  );
};

export const LayoutStandardSelector = () => {
  const { systemLayoutIndex, setSystemLayoutIndex } = useSystemLayoutModel();
  const layoutIndices: number[] = [0, 1];
  const setCurrent = (layoutIndex: number) => {
    setSystemLayoutIndex(layoutIndex);
  };
  const textDictionary: { [key in number]: string } = {
    0: 'US',
    1: 'JIS',
  };
  return (
    <DualItemsHoverSelector
      items={layoutIndices}
      currentItem={systemLayoutIndex}
      setCurrentItem={setCurrent}
      textDictionary={textDictionary}
      hint={texts.hint_assigner_topBar_keyboardSystemLayoutSelector}
    />
  );
};
