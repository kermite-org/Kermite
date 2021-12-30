import { styled } from 'alumina';

export const TooltipBalloon = styled.div`
  border: solid 1px #888;
  background: #fff;
  color: #444;
  width: 280px;
  font-size: 12px;
  border-radius: 6px;
  padding: 8px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 20px;
    bottom: -9px;
    border-top: solid 8px #444;
    border-left: solid 6px transparent;
    border-right: solid 6px transparent;
  }

  &::after {
    content: '';
    position: absolute;
    left: 20px;
    bottom: -8px;
    border-top: solid 8px #fff;
    border-left: solid 6px transparent;
    border-right: solid 6px transparent;
  }
`;
