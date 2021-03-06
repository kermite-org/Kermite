import { styled } from 'qx';

export const ConfigSubHeader = styled.div`
  margin-bottom: 4px;
`;

export const ConfigSubContent = styled.div`
  padding-left: 8px;
`;

export const ConfigVStack = styled.div`
  > * + * {
    margin-top: 4px;
  }
`;

export const ConfigRow = styled.div`
  display: flex;
  > * + * {
    margin-left: 4px;
  }
`;
