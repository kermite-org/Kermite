import { css } from 'alumina';

export const globalStyle = css`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    height: 100%;
  }

  #app {
    height: 100%;
    font-family: 'Noto Sans JP', sans-serif;
    font-size: 16px;
    color: #222;
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    font-size: 16px;
    font-weight: normal;
  }

  ul,
  li {
    list-style: none;
  }
`;
