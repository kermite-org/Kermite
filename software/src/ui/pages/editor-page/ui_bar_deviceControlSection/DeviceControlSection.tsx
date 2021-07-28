import { jsx, css } from 'qx';
import { texts, uiTheme, LinkIndicator } from '~/ui/common';
import { makeDeviceControlSectionViewModel } from '~/ui/pages/editor-page/ui_bar_deviceControlSection/DeviceControlSectionViewModel';

const cssDeviceControlSection = css`
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

export const DeviceControlSection = () => {
  const vm = makeDeviceControlSectionViewModel();
  return (
    <div css={cssDeviceControlSection}>
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
