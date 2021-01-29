import { ISelectorOption } from '~/ui-root/zones/common/commonViewModels/viewModelInterfaces';

export function makePlainSelectorOption(source: string): ISelectorOption {
  return {
    id: source,
    text: source,
  };
}
