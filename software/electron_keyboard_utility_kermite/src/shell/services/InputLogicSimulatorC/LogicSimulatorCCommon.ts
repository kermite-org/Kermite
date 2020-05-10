import { fallbackProfileData, IProfileData } from '~defs/ProfileData';

//down-tap-up
//down-hold-up
export type IKeyTrigger = 'down' | 'tap' | 'hold' | 'up';

export const logicSimulatorStateC = new (class {
  profileData: IProfileData = fallbackProfileData;
  holdLayerIds: Set<string> = new Set(['la0']);
  // holdKeySets: IHoldKeySet[] = [];
})();

export const logicSimulatorCConfig = new (class {
  usePrioritySorter: boolean = false;
  useImmediateDownUp: boolean = false;
  // useKeyBindEventAligner: boolean = false;
})();
logicSimulatorCConfig.usePrioritySorter = true;
// logicSimulatorCConfig.useKeyBindEventAligner = true;

// logicSimulatorCConfig.usePrioritySorter = false;
// logicSimulatorCConfig.useImmediateDownUp = false;
// logicSimulatorCConfig.useKeyBindEventAligner = true;
