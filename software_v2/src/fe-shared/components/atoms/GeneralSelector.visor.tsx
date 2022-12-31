import { jsx } from 'alumina';
import { ISelectorOption, makePlainSelectorOption } from '~/app-shared';
import { GeneralSelector } from './GeneralSelector';

const options: ISelectorOption[] = ['apple', 'orange', 'banana'].map(
  makePlainSelectorOption,
);

export default {
  base: <GeneralSelector options={options} value="apple" setValue={() => {}} />,
};
