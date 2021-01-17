import { ISelectorOption } from '@ui-root/viewModels/viewModelInterfaces';

export function makePlainSelectorOption(source: string): ISelectorOption {
  return {
    id: source,
    text: source,
  };
}
