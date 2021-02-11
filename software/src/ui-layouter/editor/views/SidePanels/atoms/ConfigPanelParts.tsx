import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';

function styledDiv(cssDiv: string) {
  return (props: { children: any }) => <div css={cssDiv}>{props.children}</div>;
}

export const ConfigPanel = styledDiv(css`
  margin: 5px;
`);

export const ConfigHeader = styledDiv(css`
  background: ${uiTheme.colors.clPrimary};
  border: solid 1px ${uiTheme.colors.clPrimary};
  color: ${uiTheme.colors.clDecal};
  padding: 2px 5px;
`);

export const ConfigContent = styledDiv(css`
  border: solid 1px ${uiTheme.colors.clPrimary};
  border-top: none;
  padding: 6px 8px;

  > * + * {
    margin-top: 5px;
  }
`);

export const ConfigSubHeader = styledDiv(css`
  margin-bottom: 4px;
`);

export const ConfigSubContent = styledDiv(css`
  padding-left: 8px;
`);

export const ConfigVStack = styledDiv(css`
  > * + * {
    margin-top: 4px;
  }
`);

export const ConfigRow = styledDiv(css`
  display: flex;
  > * + * {
    margin-left: 4px;
  }
`);
