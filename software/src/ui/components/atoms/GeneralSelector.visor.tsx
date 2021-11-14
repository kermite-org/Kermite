import { jsx } from 'alumina';
import { ISelectorOption, makePlainSelectorOption } from '~/ui/base';
import { GeneralSelector } from '~/ui/components/atoms/GeneralSelector';

const options: ISelectorOption[] = ['apple', 'orange', 'banana'].map(
  makePlainSelectorOption,
);

export const GeneralSelectorExamples = {
  base: <GeneralSelector options={options} value="apple" setValue={() => {}} />,
};
