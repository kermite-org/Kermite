import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';

export const WelcomePage: FC = () => (
  <div css={style}>
    <h1>Kermite</h1>
    <h2>Keyboard Ecosystem All in One</h2>
    <div className="buttos-panel">
      <div className="row"></div>
      <div className="row"></div>
    </div>
  </div>
);

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 10px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  color: #468;

  > h1 {
    font-size: 48px;
    font-weight: normal;
  }

  > h2 {
    margin-top: 15px;
    font-weight: normal;
  }

  > .buttons-panel {
    > .row {
      display: flex;
    }
  }
`;
