import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { AssignTypeSelectionPart } from './AssignTypeSelectionPart';
import { DualModeSettingsPart } from './DualModeSettingsPart';
import { appDomain, editorModel } from '~ui2/models/zAppDomain';
import {
  ClosableOverlay,
  CommonDialogFrame
} from '~ui2/views/common/CommonDialogParts';

export const ProfileConfigurationPart = () => {
  const cssBase = css`
    padding: 5px;
  `;

  const currentAssignType = editorModel.profileData.assignType;

  return <div css={cssBase}>assign model: {currentAssignType}</div>;
};

export const ProfileConfigratuionModalLayer = () => {
  const uiStatus = appDomain.uiStatusModel.status;
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
    min-height: 150px;
  `;

  return (
    <ClosableOverlay close={closeModal}>
      <CommonDialogFrame caption="profile configuration">
        <div css={cssDialogContent}>
          <AssignTypeSelectionPart />
          <DualModeSettingsPart />
        </div>
      </CommonDialogFrame>
    </ClosableOverlay>
  );
};
