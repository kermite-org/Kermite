import { qx, hx } from './basis/qx';
import { glob, setPragma, css } from 'goober';
import { DebugOverlay } from './basis/DebugOverlay';
import { appUi } from '~basis/appGlobal';
import { appModel } from '~model';
import { Arrays } from '~funcs/Arrays';

setPragma(hx);

glob`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  @import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

  html,
  body,
  #app {
    height: 100%;
  }

  #app {
    font-family: 'Roboto', sans-serif;
  }

  body {
    overflow: hidden;
  }
`;

interface StrokeStrip {
  key: string;
  downPos: number;
  upPos: number;
}

function makeStrokeStrips() {
  const { strokeEvents } = appModel;
  const strips: StrokeStrip[] = [];
  strokeEvents.forEach((ev1, idx) => {
    if (ev1.isDown === false) {
      const ev0 = strokeEvents
        .slice(0, idx)
        .reverse()
        .find((e) => e.key === ev1.key && e.isDown === true);
      if (ev0) {
        strips.push({ key: ev1.key, downPos: ev0.timePos, upPos: ev1.timePos });
      }
    }
  });
  return strips.sort((a, b) => a.downPos - b.downPos);
}

const PageContentRoot = () => {
  const strokeStrips = makeStrokeStrips();

  const cssRoot = css`
    margin: 10px;
  `;

  const cssHeader = css`
    margin-bottom: 10px;
  `;

  const cssInputTextArea = css`
    height: 30px;
    border: solid 1px #888;
    display: flex;
    align-items: center;
    width: 1000px;
    padding-left: 4px;
  `;

  const cssSvg = css`
    margin: 10px 0;
    border: solid 1px #888;
  `;

  const xs = 100;

  const barH = 20;

  const dur = 25;

  return (
    <div css={cssRoot}>
      <div css={cssHeader}>Keystroke Timing Visualizer</div>

      <div css={cssInputTextArea}>{appModel.inputText}</div>

      <svg width={1000} height={500} css={cssSvg}>
        <g transform="translate(0, 0)">
          {Arrays.iota((1000 / dur) >> 0).map((i) => {
            const x = i * dur;
            return <line x1={x} y1={0} x2={x} y2={500} stroke="#DDD" />;
          })}
        </g>

        <g transform="translate(0, 0)">
          {Arrays.iota(10).map((i) => {
            const x = i * xs;
            const w = xs;
            return (
              <rect
                x={x}
                width={w}
                height={barH}
                stroke="#F08"
                fill="transparent"
              />
            );
          })}
          <text x={4} y={barH / 2} fill="#F08" dominant-baseline="middle">
            100ms
          </text>
        </g>

        <g transform="translate(0, 30)">
          {Arrays.iota((1000 / dur) >> 0).map((i) => {
            const x = i * dur;
            const w = dur;
            return (
              <rect
                x={x}
                width={w}
                height={barH}
                stroke="#F80"
                fill="transparent"
              />
            );
          })}
          <text x={4} y={barH / 2} fill="#F80" dominant-baseline="middle">
            {dur}ms
          </text>
        </g>

        <g transform="translate(0, 70)">
          {strokeStrips.map((st, idx) => {
            const xpos = st.downPos;
            const ypos = idx * 40;
            const w = st.upPos - st.downPos;
            return (
              <g transform={`translate(${xpos}, ${ypos})`}>
                <rect
                  width={w}
                  height={barH}
                  stroke="#08F"
                  fill="transparent"
                />
                <text x={4} y={barH / 2} fill="#08F" dominant-baseline="middle">
                  {st.key}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <div>
        <div> space: reset</div>
        <div> other keys: add stroke</div>
      </div>
    </div>
  );
};

const SiteRoot = () => {
  const cssSiteRoot = css`
    height: 100%;
  `;
  return (
    <div css={cssSiteRoot}>
      <PageContentRoot />
      <DebugOverlay debugObj={appUi.debugObject} />
    </div>
  );
};

export function initializeView() {
  appUi.rerender = qx.rerender;
  qx.render(() => <SiteRoot />, document.getElementById('app')!);

  window.addEventListener('resize', appUi.rerender);

  function renderLoop() {
    if (appUi.reqRerender) {
      qx.rerender();
      appUi.reqRerender = false;
    }
    requestAnimationFrame(renderLoop);
  }
  renderLoop();
}
