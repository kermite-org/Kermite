import { css } from 'goober';
import { h } from 'qx';
import { reflectFieldChecked } from '~/ui-common';
import {
  ClosableOverlay,
  CommonDialogFrame,
} from '~/ui-root/base/dialog/CommonDialogParts';
import { models } from '~/ui-root/models';
import { AssignTypeSelectionPart } from './AssignTypeSelectionPart';
import { DualModeSettingsPart } from './DualModeSettingsPart';

const ShiftCancelOptionPart = () => {
  const { settings } = models.editorModel.profileData;
  return (
    <div
      css={css`
        margin-top: 10px;
      `}
    >
      <label>
        use shift cancel feature
        <input
          type="checkbox"
          checked={settings.useShiftCancel}
          onChange={reflectFieldChecked(settings, 'useShiftCancel')}
        />
      </label>
    </div>
  );
};

export const ProfileConfigratuionModalLayer = () => {
  const uiStatus = models.uiStatusModel.status;
  const visible = uiStatus.profileConfigModalVisible;
  const closeModal = () => {
    uiStatus.profileConfigModalVisible = false;
  };

  if (!visible) {
    return null;
  }

  const cssDialogContent = css`
    margin: 10px;
    color: black;
    min-height: 140px;
  `;

  return (
    <ClosableOverlay close={closeModal}>
      <CommonDialogFrame caption="profile configuration">
        <div css={cssDialogContent}>
          <AssignTypeSelectionPart />
          <DualModeSettingsPart />
          <ShiftCancelOptionPart />
        </div>
      </CommonDialogFrame>
    </ClosableOverlay>
  );
};
