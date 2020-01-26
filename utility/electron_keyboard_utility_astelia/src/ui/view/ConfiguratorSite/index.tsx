import { css, Global, jsx } from '@emotion/core';
import React from 'react';
import {
  useProfileManagerStateResources,
  useRealtimeKeyboardEventReceiver
} from '~ui/resourceHooks';
import { AssignSection } from './sections/AssignSection';
import { KeyboardSection } from './sections/KeyboardSection';
import { LayersSection } from './sections/LayersSection';
import { ProfileSelection } from './sections/ProfileSection';
import { TitleBarSection } from './sections/TitleBarSection';
import { UiTheme } from './UiTheme';

const KeyAssignEditPage = () => {
  const { clPanelBox, editorPartMargin: mm } = UiTheme;

  const cssKeyAssignEditPageRoot = css`
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    > div {
      margin-left: ${mm};
      margin-right: ${mm};
    }
    > div:first-of-type {
      margin-top: ${mm};
    }
    > div + div {
      margin-top: ${mm};
    }
    > div:last-of-type {
      margin-bottom: ${mm};
    }
  `;

  const cssEditTopBarBox = css`
    background: ${clPanelBox};
    height: 40px;
    flex-shrink: 0;
  `;

  const cssEditMainRow = css`
    flex-grow: 1;
    display: flex;

    > div + div {
      margin-left: ${mm};
    }
  `;

  const cssEditMainColumn = css`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    > div + div {
      margin-top: ${mm};
    }
  `;

  const cssKeyboardPartBox = css`
    background: ${clPanelBox};
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-width: 100px;
    min-height: 50px;
  `;

  const cssAssignPartBox = css`
    background: ${clPanelBox};
    height: 230px;
    flex-shrink: 0;
  `;

  const cssEditSideBarColumn = css`
    width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    > div + div {
      margin-top: ${mm};
    }
  `;

  const cssLayersPartBox = css`
    background: ${clPanelBox};
    height: 300px;
    flex-shrink: 0;
  `;

  const cssRestPartBox = css`
    background: ${clPanelBox};
    flex-grow: 1;
  `;

  return (
    <div css={cssKeyAssignEditPageRoot}>
      <div css={cssEditTopBarBox}>
        <ProfileSelection />
      </div>
      <div css={cssEditMainRow}>
        <div css={cssEditMainColumn}>
          <div css={cssKeyboardPartBox}>
            <KeyboardSection />
          </div>
          <div css={cssAssignPartBox}>
            <AssignSection />
          </div>
        </div>
        <div css={cssEditSideBarColumn}>
          <div css={cssLayersPartBox}>
            <LayersSection />
          </div>
          <div css={cssRestPartBox} />
        </div>
      </div>
    </div>
  );
};
export const ConfiguratorContentRoot_DesignDev = () => {
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

  return <ConfiguratorContentRoot_DesignDev />;
};
