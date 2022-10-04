import { applyGlobalStyle, css, domStyled, FC, jsx } from "alumina";
import { render } from "alumina";

function createNewProject() {}

const PageRoot: FC = () => {
  applyGlobalStyle(css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html,
    body,
    #app {
      height: 100%;
    }
  `);
  return domStyled(
    <div>
      <div class="app-title-bar">Kermite</div>
      <div class="top-bar">
        ファイル
        <br />
        <div onClick={createNewProject}>-新規プロジェクト作成</div>
      </div>
      <div class="main-row">
        <div class="side-bar">プロジェクト</div>
        <div class="main-column">editor</div>
      </div>
    </div>,
    css`
      height: 100%;
      display: flex;
      flex-direction: column;
      font-family: "Noto Sans JP", sans-serif;
      font-size: 16px;
      color: #222;

      > .app-title-bar {
        flex-shrink: 0;
        background: #08f;
        padding: 2px 5px;
        color: #fff;
      }

      > .top-bar {
        flex-shrink: 0;
        background: #ddd;
        padding: 2px 5px;
      }
      > .main-row {
        flex-grow: 1;

        display: flex;
        > .side-bar {
          width: 200px;
          flex-shrink: 0;
          border: solid 1px #aaa;
          border-right: none;
          padding: 5px;
        }
        > .main-column {
          flex-grow: 1;
          border: solid 1px #aaa;
          padding: 5px;
        }
      }
    `
  );
};

function start() {
  render(() => <PageRoot />, document.getElementById("app"));
}

window.addEventListener("load", start);
