import { jsx, css, FC } from 'alumina';
import { colors, texts } from '~/ui/base';
import { LinkIndicator } from '~/ui/elements';
import { makeDeviceControlSectionViewModel } from '~/ui/pages/AssignerPage/ui_bar_deviceControlSection/DeviceControlSectionViewModel';

export const DeviceControlSection: FC = () => {
  const vm = makeDeviceControlSectionViewModel();
  return (
    <div css={style}>
      <div
        class="keyboardName"
        data-hint={texts.assignerTopBarHint.connectedKeyboardName}
      >
        {vm.currentDeviceKeyboardName}
      </div>
      <LinkIndicator isActive={vm.isDeviceConnected} />
    </div>
  );
};

const style = css`
  display: flex;
  align-items: center;
  margin-right: 10px;

  .keyboardName {
    color: ${colors.clLinkIndicator};
  }

  > * + * {
    margin-left: 7px;
  }
`;
