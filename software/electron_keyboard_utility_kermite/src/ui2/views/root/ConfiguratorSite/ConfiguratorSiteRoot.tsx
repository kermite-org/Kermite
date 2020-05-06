import { css } from 'goober';
import { KeyAssignEditPage } from './KeyAssingEditPage/KeyAssignEditPage';
import { hx } from '~ui2/views/basis/qx';
import { ProfileManagementPart } from './KeyAssingEditPage/ProfilesSection/ProfileManagementPart';
import { CustomWindowFrame } from './WindowFrame/CustomWindowFrame';
import { UiTheme } from '~ui2/views/common/UiTheme';

export function ConfiguratorSiteRootContent() {
  const cssPageRoot = css`
    height: 100%;
    display: flex;
    flex-direction: column;
  `;

  const KeyAssignsEditPageFrame = css`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    > * {
      flex-grow: 1;
    }
  `;

  return (
    <div css={cssPageRoot}>
      <ProfileManagementPart />
      <div css={KeyAssignsEditPageFrame}>
        <KeyAssignEditPage />
      </div>
    </div>
  );
}

export const ConfiguratorSiteRoot = () => {
  const cssContentRow = css`
    background: ${UiTheme.clBackground};
    color: #fff;
    display: flex;
  `;

  const cssNavigationColumn = css`
    width: 50px;
    flex-shrink: 0;
    background: ${UiTheme.clNavigationColumn};
  `;

  const cssMainColumn = css`
    flex-grow: 1;
  `;

  return (
    <CustomWindowFrame>
      <div css={cssContentRow}>
        <div css={cssNavigationColumn}></div>
        <div css={cssMainColumn}>
          <ConfiguratorSiteRootContent />
        </div>
      </div>
    </CustomWindowFrame>
  );
};
