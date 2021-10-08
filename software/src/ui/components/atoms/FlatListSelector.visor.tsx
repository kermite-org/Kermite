import { jsx } from 'qx';
import { ISelectorOption, makePlainSelectorOption } from '~/ui/base';
import { FlatListSelector } from '~/ui/components/atoms/FlatListSelector';

const options: ISelectorOption[] = ['apple', 'orange', 'banana'].map(
  makePlainSelectorOption,
);

export const FlatListSelectorExamples = {
  base: (
    <FlatListSelector
      options={options}
      value="apple"
      setValue={() => {}}
      size={10}
    />
  ),
};
