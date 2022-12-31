import { jsx } from 'alumina';
import { ISelectorOption, makePlainSelectorOption } from '~/app-shared';
import { FlatListSelector } from './FlatListSelector';

const options: ISelectorOption[] = ['apple', 'orange', 'banana'].map(
  makePlainSelectorOption,
);

export default {
  base: (
    <FlatListSelector
      options={options}
      value="apple"
      setValue={() => {}}
      size={10}
    />
  ),
};
