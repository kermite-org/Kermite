import { FC, jsx } from 'qx';
import { routerConstants } from '~/shared';
import { ISelectorOptionN } from '~/ui/common';
import { GeneralSelectorN } from '~/ui/common/components/atoms/GeneralSelectorN';

type Props = {
  value: number;
  onChange: (newValue: number) => void;
};

const options: ISelectorOptionN[] = [
  { value: 0, label: 'Main' },
  { value: 1, label: 'Alter' },
  { value: routerConstants.RoutingChannelValueAny, label: 'any' },
];

export const RoutingTargetChannelSelector: FC<Props> = ({
  value,
  onChange,
}) => {
  return (
    <GeneralSelectorN options={options} value={value} setValue={onChange} />
  );
};
