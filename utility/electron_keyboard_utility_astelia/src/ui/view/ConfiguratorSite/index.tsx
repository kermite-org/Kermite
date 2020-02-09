import { css, Global, jsx } from '@emotion/core';
import React from 'react';
import {
  useProfileManagerStateResources,
  useRealtimeKeyboardEventReceiver
} from '~ui/resourceHooks';

import { TitleBarSection } from './sections/TitleBarSection';
import { UiTheme } from './UiTheme';
import { KeyAssignEditPage } from './KeyAssignEditPage';

const ConfiguratorContentView = () => {
  const cssGlobal = css`
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

  const { clBackground, clNavigationColumn, clStatusBar } = UiTheme;

  const cssRoot = css`
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;

  const cssTitleBarRow = css`
    flex-shrink: 0;
  `;

  const cssBodyRow = css`
    flex-grow: 1;
    background: ${clBackground};
    color: #fff;
    display: flex;
  `;

  const cssNavigationColumn = css`
    width: 50px;
    flex-shrink: 0;
    background: ${clNavigationColumn};
  `;

  const cssStatusBar = css`
    background: ${clStatusBar};
    height: 28px;
    flex-shrink: 0;
  `;

  return (
    <React.Fragment>
      <Global styles={cssGlobal} />
      <div css={cssRoot}>
        <div css={cssTitleBarRow}>
          <TitleBarSection />
        </div>
        <div css={cssBodyRow}>
          <div css={cssNavigationColumn}></div>
          <KeyAssignEditPage />
        </div>
        <div css={cssStatusBar} />
      </div>
    </React.Fragment>
  );
};

export const ConfiguratorContentRoot = () => {
  useProfileManagerStateResources();
  useRealtimeKeyboardEventReceiver();

  return <ConfiguratorContentView />;
};
