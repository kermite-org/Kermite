import { jsx, css, FC } from 'qx';
import { texts, uiTheme } from '~/ui/base';
import { LinkIndicator } from '~/ui/components';
import { makeDeviceControlSectionViewModel } from '~/ui/pages/assigner-page/ui_bar_deviceControlSection/DeviceControlSectionViewModel';

export const DeviceControlSection: FC = () => {
  const vm = makeDeviceControlSectionViewModel();
  return (
    <div css={style}>
      <div
        className="keyboardName"
        data-hint={texts.hint_assigner_topBar_connectedKeyboardName}
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
    color: ${uiTheme.colors.clLinkIndicator};
  }

  > * + * {
    margin-left: 7px;
  }
`;
