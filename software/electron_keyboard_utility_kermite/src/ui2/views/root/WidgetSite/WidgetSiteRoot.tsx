/* eslint-disable react/no-unknown-property */
import { h } from '~ui2/views/basis/qx';
import { css } from 'goober';
import { siteModel, editorModel } from '~ui2/models/zAppDomain';
import { WidgetKeyUnitCardsPart } from './WidgetKeyUnitCardsPart';
import { linerInterpolateValue } from '~funcs/Utils';
import { Display } from '~ui2/views/common/helperComponents';

function KeyboardSvgView() {
  const cssSvg = css``;

  const winw = window.innerWidth;

  const sw = linerInterpolateValue(winw, 200, 900, 0.8, 0.3, true);

  const { keyboardShape } = editorModel.profileData;

  return (
    <svg width="600" height="240" css={cssSvg} viewBox="-300 -120 600 240">
      <g
        transform="scale(2) translate(0, -53.5)"
        stroke-width={sw}
        stroke-linejoin="round"
      >
        <path d={keyboardShape.bodyPathMarkupText} stroke="#003" fill="#89C" />
        <WidgetKeyUnitCardsPart />
      </g>
    </svg>
  );
}

function MainPanel() {
  const sc = window.innerWidth / 600;

  const cssPanel = css`
    width: 600px;
    height: 240px;
    user-select: none;
    transform: scale(${sc}, ${sc});
    position: relative;
    -webkit-app-region: drag;
  `;

  const cssConfigButton = css`
    position: absolute;
    right: 18px;
    top: 17px;
    -webkit-app-region: no-drag;
    color: #fff;
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: #0cf;
    }
  `;

  const onOpenButton = () => {
    siteModel.setWidgetMode(false);
  };

  return (
    <div css={cssPanel}>
      <div css={cssConfigButton} onClick={onOpenButton}>
        <i className="fa fa-cog" />
      </div>
      <KeyboardSvgView />
    </div>
  );
}

const WindowActiveChrome = () => {
  const cssBase = css`
    position: absolute;
    pointer-events: none;
    width: 100%;
    height: 100%;
    /* border: solid 1px rgba(0, 128, 255, 0.3); */
    /* background: rgba(0, 160, 255, 0.15); */

    > div {
      position: absolute;
      width: 5px;
      height: 5px;
      background: #08f;
      border-radius: 50%;
      margin: 2px;
    }

    .tl {
      top: 0;
      left: 0;
    }

    .tr {
      top: 0;
      right: 0;
    }

    .bl {
      bottom: 0;
      left: 0;
    }

    .br {
      bottom: 0;
      right: 0;
    }
  `;
  return (
    <div css={cssBase}>
      <div class="tl" />
      <div class="tr" />
      <div class="bl" />
      <div class="br" />
    </div>
  );
};

export const WidgetSiteRoot = () => {
  const cssRoot = css`
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;

    &[data-window-active] {
    }
  `;

  return (
    <div css={cssRoot}>
      {siteModel.isWindowActive && <WindowActiveChrome />}
      <MainPanel />
      {/* <Display visible={siteModel.isWindowActive}>
        <WindowCornerMarkers />
      </Display> */}
    </div>
  );
};

//debug
// export const WidgetSiteRoot1 = () => {
//   return (
//     <div>
//       widget
//       <button onClick={() => siteModel.setWidgetMode(false)}>back</button>
//     </div>
//   );
// };
