import { applyGlobalStyle, css } from 'alumina';

export function initializeCss() {
  applyGlobalStyle(css`
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

    #app {
      font-family: 'Roboto', sans-serif;
    }

    body {
      overflow: hidden;
      background: #fff;
    }
  `);
}
