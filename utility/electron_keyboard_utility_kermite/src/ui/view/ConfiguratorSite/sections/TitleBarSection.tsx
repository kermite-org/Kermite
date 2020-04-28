import { css, jsx } from '@emotion/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch } from 'react-redux';
import { sendIpcPacketSync } from '~ui/state/ipc';
import { siteSlice } from '~ui/state/siteSlice';

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
      <FontAwesomeIcon icon={props.icon as IconProp} />
    </div>
  );
};

const ControlButtonsPart = () => {
  const dispatch = useDispatch();
  const onWidgetButton = () => {
    dispatch(siteSlice.actions.setWidgetMode(true));
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
      <ControlButton icon="feather-alt" onClick={onWidgetButton} />
      <ControlButton icon="window-minimize" onClick={onMinimizeButton} />
      <ControlButton icon="window-maximize" onClick={onMaximizeButton} />
      <ControlButton icon="times" onClick={onCloseButton} />
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
      <div className="text">Keyboard Configurator Utility For Astelia</div>
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
