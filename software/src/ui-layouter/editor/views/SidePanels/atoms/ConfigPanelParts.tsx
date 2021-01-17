import { uiTheme } from '@ui-layouter/base';
import { css } from 'goober';
import { h } from 'qx';

function styledDiv(cssDiv: string) {
  return (props: { children: any }) => <div css={cssDiv}>{props.children}</div>;
}

export const ConfigPanel = styledDiv(css`
  margin: 5px;
`);

export const ConfigHeader = styledDiv(css`
  color: ${uiTheme.colors.primary};
  border: solid 1px ${uiTheme.colors.primary};
  background: ${uiTheme.colors.primaryWeaken};
  padding: 2px 5px;
`);

export const ConfigContent = styledDiv(css`
  padding: 6px 8px;
  border: solid 1px ${uiTheme.colors.primary};
  border-top: none;

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
