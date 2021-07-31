import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { onboadingPanelDisplayStateModel } from '~/ui/commonModels';
import { WelcomePageButton } from '~/ui/components/atoms';

export const WelcomePage: FC = () => (
  <div css={style}>
    <h1>Kermite</h1>
    <h2>Keyboard Ecosystem All in One</h2>
    <div className="buttons-panel">
      <div className="row">
        <WelcomePageButton className="button">English</WelcomePageButton>
        <WelcomePageButton className="button" active={true}>
          日本語
        </WelcomePageButton>
      </div>
      <div className="row">
        <WelcomePageButton
          className="button"
          onClick={onboadingPanelDisplayStateModel.toggleOnboardingPanel}
        >
          使い方のナビゲーションを表示
        </WelcomePageButton>
      </div>
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

  color: #469;

  > h1 {
    font-size: 48px;
    font-weight: normal;
  }

  > h2 {
    margin-top: 15px;
    font-weight: normal;
  }

  > .buttons-panel {
    margin-top: 50px;
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 40px;

    > .row {
      width: 100%;
      display: flex;
      justify-content: center;
      gap: 30px;

      > .button {
        width: 100%;
      }
    }
  }
`;
