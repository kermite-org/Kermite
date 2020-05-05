import { css } from 'goober';
import { sendIpcPacketSync } from '~ui2/models/ipc';
import { siteModel } from '~ui2/models/zAppDomain';
import { hx } from '~ui2/views/basis/qx';

const ControlButton = (props: { icon: string; onClick: () => void }) => {
  const cssButton = css`
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 40px;
    height: 30px;
    color: #fff;
    &:hover {
      background: #f8b;
    }
    -webkit-app-region: no-drag;
  `;
  return (
    <div css={cssButton} onClick={props.onClick}>
      {/* <FontAwesomeIcon icon={props.icon} /> */}
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
    sendIpcPacketSync({ reloadApplication: true });
  };
  const isDevelopment = location.protocol === 'http:';
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
    sendIpcPacketSync({ minimizeWindow: true });
  };

  const onMaximizeButton = () => {
    sendIpcPacketSync({ maximizeWindow: true });
  };

  const onCloseButton = () => {
    sendIpcPacketSync({ closeWindow: true });
  };

  const cssButtonsBox = css`
    display: flex;
    align-items: center;
    height: 100%;
  `;

  return (
    <div css={cssButtonsBox}>
      <ReloadButtonPart />
      <ControlButton icon="fa fa-feather-alt" onClick={onWidgetButton} />
      <ControlButton icon="fa fa-window-minimize" onClick={onMinimizeButton} />
      <ControlButton icon="fa fa-window-maximize" onClick={onMaximizeButton} />
      <ControlButton icon="fa fa-times" onClick={onCloseButton} />
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
    background: #f08;
  `;

  return (
    <div css={cssTitleBarDiv}>
      <TitlePart />
      <ControlButtonsPart />
    </div>
  );
};
