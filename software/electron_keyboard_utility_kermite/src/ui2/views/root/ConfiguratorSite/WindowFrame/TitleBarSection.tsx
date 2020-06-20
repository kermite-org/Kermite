import { css } from 'goober';
import { backendAgent } from '~ui2/models/dataSource/ipc';
import { siteModel } from '~ui2/models/zAppDomain';
import { h } from '~ui2/views/basis/qx';
import { uiTheme } from '~ui2/models/UiTheme';

const ControlButton = (props: { icon: string; onClick: () => void }) => {
  const cssButton = css`
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 40px;
    height: 30px;
    color: ${uiTheme.colors.clWindowButtonFace};
    &:hover {
      background: ${uiTheme.colors.clWindowButtonHoverBack};
    }
    -webkit-app-region: no-drag;
  `;
  return (
    <div css={cssButton} onClick={props.onClick}>
      <i className={props.icon} />
    </div>
  );
};

const ReloadButtonPart = () => {
  const cssReloadButton = css`
    padding: 3px 6px;
    margin-right: 10px;
    cursor: pointer;
  `;
  const onReloadButton = () => {
    backendAgent.reloadApplication();
  };
  const { isDevelopment } = siteModel;
  return (
    <div>
      {isDevelopment && (
        <button css={cssReloadButton} onClick={onReloadButton}>
          Restart
        </button>
      )}
    </div>
  );
};

const ControlButtonsPart = () => {
  const onWidgetButton = () => {
    siteModel.setWidgetMode(true);
  };

  const onMinimizeButton = () => {
    backendAgent.minimizeWindow();
  };

  const onMaximizeButton = () => {
    backendAgent.maximizeWindow();
  };

  const onCloseButton = () => {
    backendAgent.closeWindow();
  };

  const cssButtonsBox = css`
    display: flex;
    align-items: center;
    height: 100%;
  `;

  return () => (
    <div css={cssButtonsBox}>
      <ReloadButtonPart />
      <ControlButton
        icon="fa fa-feather-alt"
        onClick={onWidgetButton}
        qxOptimizer="deepEqual"
      />
      <ControlButton
        icon="fa fa-window-minimize"
        onClick={onMinimizeButton}
        qxOptimizer="deepEqual"
      />
      <ControlButton
        icon="fa fa-window-maximize"
        onClick={onMaximizeButton}
        qxOptimizer="deepEqual"
      />
      <ControlButton
        icon="fa fa-times"
        onClick={onCloseButton}
        qxOptimizer="deepEqual"
      />
    </div>
  );
};

const TitlePart = () => {
  const cssTitlePart = css`
    display: flex;
    margin-left: 8px;

    > .icon {
    }
    > .text {
      margin-left: 4px;
      color: #fff;
      font-size: 14px;
    }
  `;
  return (
    <div css={cssTitlePart}>
      <img className="icon" src="appicon.png" />
      <div className="text">Kermite</div>
    </div>
  );
};

export const TitleBarSection = () => {
  const cssTitleBarDiv = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    -webkit-app-region: drag;
    background: ${uiTheme.colors.clTitleBar};
  `;

  return (
    <div css={cssTitleBarDiv}>
      <TitlePart />
      <ControlButtonsPart />
    </div>
  );
};
