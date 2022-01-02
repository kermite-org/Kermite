import { jsx } from 'alumina';
import { ISelectorOption, makePlainSelectorOption } from '~/ui/base';
import { FlatListSelector } from '~/ui/components/atoms/FlatListSelector';

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
