import { styled } from 'goober';
import { uiTheme } from '~/ui-common';

export const ConfigPanel = styled('div')`
  margin: 5px;
`;

export const ConfigHeader = styled('div')`
  background: ${uiTheme.colors.clPrimary};
  border: solid 1px ${uiTheme.colors.clPrimary};
  color: ${uiTheme.colors.clDecal};
  padding: 2px 5px;
`;

export const ConfigContent = styled('div')`
  border: solid 1px ${uiTheme.colors.clPrimary};
  border-top: none;
  padding: 6px 8px;

  > * + * {
    margin-top: 5px;
  }
`;

export const ConfigSubHeader = styled('div')`
  margin-bottom: 4px;
`;

export const ConfigSubContent = styled('div')`
  padding-left: 8px;
`;

export const ConfigVStack = styled('div')`
  > * + * {
    margin-top: 4px;
  }
`;

export const ConfigRow = styled('div')`
  display: flex;
  > * + * {
    margin-left: 4px;
  }
`;
