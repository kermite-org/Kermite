import { h } from 'qx';
import { applyGlobalStyle, css, setup } from 'qx/cssinjs';

export function initializeCss() {
  setup(h);

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
