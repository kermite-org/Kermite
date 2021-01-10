import { ISelectorOption } from '~/viewModels/viewModelInterfaces';

export function makePlainSelectorOption(source: string): ISelectorOption {
  return {
    id: source,
    text: source,
  };
}
