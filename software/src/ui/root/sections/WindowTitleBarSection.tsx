import { jsx, css, FC } from 'alumina';
import { colors } from '~/ui/base';
import { WindowTitlePart } from '~/ui/components';
import { DeviceControlSection } from '~/ui/pages/assignerPage/ui_bar_deviceControlSection/DeviceControlSection';

export const WindowTitleBarSection: FC = () => (
  <div class={style}>
    <WindowTitlePart />
    <DeviceControlSection />
    {/* <WindowControlButtonsPart /> */}
  </div>
);

const style = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${colors.clWindowBar};
  height: 30px;
`;
