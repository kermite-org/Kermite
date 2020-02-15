import { css, Global, jsx } from '@emotion/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Nums } from '~funcs/Nums';
import { siteSlice } from '~ui/state/siteSlice';
import { AppState } from '../../state/store';
import { getKeyboardShapeByBreedName } from './KeyboardShapes';

const cssGlobal = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #app {
    height: 100%;
  }

  body {
    overflow: hidden;
  }
`;

function KeyboardSvgView() {
  const cssSvg = css``;

  const winw = window.innerWidth;

  const sw = Nums.vmap(winw, 200, 900, 0.8, 0.3, true);

  const keyPressedFlags = useSelector(
    (state: AppState) => state.player.pressedKeyFlags
  );

  const keyboardShape = getKeyboardShapeByBreedName('astelia');
  return (
    <svg width="600" height="240" css={cssSvg} viewBox="-300 -120 600 240">
      <g
        transform="scale(2) translate(0, -53.5)"
        strokeWidth={sw}
        strokeLinejoin="round"
      >
        <path d={keyboardShape.bodyPathMarkupText} stroke="#003" fill="#89C" />

        {keyboardShape.keyPositions.map(a => {
          const fillColor = keyPressedFlags[a.id] ? '#F08' : '#FFF';
          return (
            <g
              transform={`translate(${a.x}, ${a.y}) rotate(${a.r}) `}
              key={a.id}
            >
              <rect
                key={a.id}
                x={-9}
                y={-9}
                width={18}
                height={18}
                stroke="#003"
                fill={fillColor}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function MainPanel() {
  const [winSize, setWinSize] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });

  React.useEffect(() => {
    const onresizeHandler = () => {
      setWinSize({
        w: window.innerWidth,
        h: window.innerHeight
      });
    };
    window.addEventListener('resize', onresizeHandler);
    return () => window.removeEventListener('resize', onresizeHandler);
  }, []);

  const sc = winSize.w / 600;

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

  const dispatch = useDispatch();
  const onOpenButton = () => {
    dispatch(siteSlice.actions.setWidgetMode(false));
  };

  return (
    <div css={cssPanel}>
      <div css={cssConfigButton} onClick={onOpenButton}>
        <FontAwesomeIcon icon="cog" />
      </div>
      <KeyboardSvgView />
    </div>
  );
}

export const WidgetContentRoot = () => {
  const cssRoot = css`
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  return (
    <div css={cssRoot}>
      <Global styles={cssGlobal} />
      <MainPanel />
    </div>
  );
};
