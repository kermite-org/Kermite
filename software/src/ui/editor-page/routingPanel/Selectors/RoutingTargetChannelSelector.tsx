import { FC, jsx } from 'qx';
import { ISelectorOptionN } from '~/ui/common';
import { GeneralSelectorN } from '~/ui/common/components/atoms/GeneralSelectorN';

type Props = {
  value: number;
  onChange: (newValue: number) => void;
};

const options: ISelectorOptionN[] = [
  { value: 0, label: 'main' },
  { value: 1, label: 'alter' },
];

export const RoutingTargetChannelSelector: FC<Props> = ({
  value,
  onChange,
}) => {
  return (
    <GeneralSelectorN options={options} value={value} setValue={onChange} />
  );
};
