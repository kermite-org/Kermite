import { css } from 'goober';
import { KeyAssignEditPage } from './realms/KeyAssignEditPage';
import { SimulatorInputBar } from './realms/SimulatorInputBar';
import { hx } from '~views/basis/qx';

export function PageContentRoot() {
  const cssPageRoot = css`
    height: 100%;
    display: flex;
    flex-direction: column;
    border: solid 1px #0f0;
  `;

  const KeyAssignsEditPageFrame = css`
    border: solid 2px #f80;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    > * {
      flex-grow: 1;
    }
  `;

  return (
    <div css={cssPageRoot}>
      <SimulatorInputBar />
      <div css={KeyAssignsEditPageFrame}>
        <KeyAssignEditPage />
      </div>
    </div>
  );
}
