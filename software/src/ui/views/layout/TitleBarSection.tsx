import { css } from 'goober';
import { h } from '~lib/qx';
import { uiTheme } from '~ui/core';
import { TitleBarViewModel } from '~ui/viewModels/TitleBarViewModel';

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

const ReloadButtonPart = ({ vm }: { vm: TitleBarViewModel }) => {
  const cssReloadButton = css`
    padding: 3px 6px;
    margin-right: 10px;
    cursor: pointer;
  `;
  return (
    <div>
      {vm.showReloadButton && (
        <button css={cssReloadButton} onClick={vm.onReloadButton}>
          Restart
        </button>
      )}
    </div>
  );
};

const ControlButtonsPart = ({ vm }: { vm: TitleBarViewModel }) => {
  const cssButtonsBox = css`
    display: flex;
    align-items: center;
    height: 100%;
  `;

  return (
    <div css={cssButtonsBox}>
      <ReloadButtonPart vm={vm} />
      <ControlButton
        icon="fa fa-feather-alt"
        onClick={vm.onWidgetButton}
        qxOptimizer="deepEqual"
      />
      <ControlButton
        icon="fa fa-window-minimize"
        onClick={vm.onMinimizeButton}
        qxOptimizer="deepEqual"
      />
      <ControlButton
        icon="fa fa-window-maximize"
        onClick={vm.onMaximizeButton}
        qxOptimizer="deepEqual"
      />
      <ControlButton
        icon="fa fa-times"
        onClick={vm.onCloseButton}
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

export const TitleBarSection = ({ vm }: { vm: TitleBarViewModel }) => {
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
      <ControlButtonsPart vm={vm} />
    </div>
  );
};
