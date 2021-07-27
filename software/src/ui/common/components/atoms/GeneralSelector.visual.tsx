import { jsx } from 'qx';
import { ISelectorOption, makePlainSelectorOption } from '~/ui/common/base';
import { GeneralSelector } from '~/ui/common/components/atoms/GeneralSelector';

const options: ISelectorOption[] = ['apple', 'orange', 'banana'].map(
  makePlainSelectorOption,
);

export const GeneralSelectorExamples = {
  base: (
    <GeneralSelector options={options} value={'apple'} setValue={() => {}} />
  ),
};
