import { css, FC, jsx } from 'alumina';
import { IFirmwareTargetDevice } from '~/shared';
import { IFirmwareVariationSelectorItem } from '~/ui/base';
import { SvgIcon_McuSquare } from '~/ui/constants';

type Props = {
  items: IFirmwareVariationSelectorItem[];
  variationId: string;
  setVariationId: (value: string) => void;
};

export const FirmwareVariationSelector: FC<Props> = ({
  items,
  variationId,
  setVariationId,
}) => {
  const style = css`
    background: #bbb;
    display: flex;
    padding: 12px;
    gap: 12px;
    overflow-x: auto;
  `;
  return (
    <div class={style}>
      {items.map((item) => (
        <FirmwareVariationItemCard
          key={item.variationId}
          variationName={item.variationName}
          mcuType={item.mcuType}
          selected={item.variationId === variationId}
          setSelected={() => setVariationId(item.variationId)}
        />
      ))}
    </div>
  );
};

const FirmwareVariationItemCard: FC<{
  variationName: string;
  mcuType: IFirmwareTargetDevice;
  selected: boolean;
  setSelected: () => void;
}> = ({ variationName, mcuType, selected, setSelected }) => {
  const style = css`
    padding: 10px 15px;
    display: flex;
    align-items: center;
    gap: 7px;
    background: #fff;
    color: #000;

    cursor: pointer;
    &:hover,
    &.--selected {
      background: #cef;
    }

    > .icon-box {
      display: grid;
      justify-items: center;
      align-items: center;
      > * {
        grid-column: 1;
        grid-row: 1;
      }
      > .icon {
        width: 40px;
      }
      > .text {
        font-size: 12px;
        color: #fff;
      }
    }
  `;
  const mcuLabelMap: Record<IFirmwareTargetDevice, string> = {
    // atmega32u4: 'AVR',
    rp2040: 'RP',
  };
  return (
    <div class={[style, selected && '--selected']} onClick={setSelected}>
      <div class="icon-box">
        <SvgIcon_McuSquare class="icon" />
        <div class="text">{mcuLabelMap[mcuType]}</div>
      </div>
      {variationName}
    </div>
  );
};
