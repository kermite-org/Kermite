import { jsx, css } from 'qx';
import { texts, uiTheme } from '~/ui/base';
import { LinkIndicator } from '~/ui/components_editor';
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
