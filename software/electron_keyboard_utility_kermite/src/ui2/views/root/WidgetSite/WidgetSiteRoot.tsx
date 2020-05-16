/* eslint-disable react/no-unknown-property */
import { h } from '~ui2/views/basis/qx';
import { Nums } from '~funcs/Nums';
import { css } from 'goober';
import { siteModel, playerModel, editorModel } from '~ui2/models/zAppDomain';

function KeyboardSvgView() {
  const cssSvg = css``;

  const winw = window.innerWidth;

  const sw = Nums.vmap(winw, 200, 900, 0.8, 0.3, true);

  const { keyStates } = playerModel;
  const { keyboardShape } = editorModel.profileData;

  // const keyboardShape = getKeyboardShapeByBreedName('astelia');
  return (
    <svg width="600" height="240" css={cssSvg} viewBox="-300 -120 600 240">
      <g
        transform="scale(2) translate(0, -53.5)"
        stroke-width={sw}
        stroke-linejoin="round"
      >
        <path d={keyboardShape.bodyPathMarkupText} stroke="#003" fill="#89C" />

        {keyboardShape.keyUnits.map((a) => {
          const fillColor = keyStates[a.id] ? '#F08' : '#FFF';
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
  // const [winSize, setWinSize] = React.useState({
  //   w: window.innerWidth,
  //   h: window.innerHeight
  // });

  // React.useEffect(() => {
  //   const onresizeHandler = () => {
  //     setWinSize({
  //       w: window.innerWidth,
  //       h: window.innerHeight
  //     });
  //   };
  //   window.addEventListener('resize', onresizeHandler);
  //   return () => window.removeEventListener('resize', onresizeHandler);
  // }, []);

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

export const WidgetSiteRoot = () => {
  const cssRoot = css`
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  return (
    <div css={cssRoot}>
      <MainPanel />
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
