import { styled } from 'alumina';

export const HFlex = styled.div`
  display: flex;
  align-items: center;
`;

export const Indent = styled.div`
  margin-left: 10px;
`;

export const styleWidthSpec = (width: number) => ({ width: `${width}px` });
