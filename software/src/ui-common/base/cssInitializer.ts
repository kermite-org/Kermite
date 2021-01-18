import { glob, setup } from 'goober';
import { h } from 'qx';

export function initializeCss() {
  setup(h);

  glob`
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
      background: #FFF;
    }
  `;
}
