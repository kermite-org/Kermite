import { css } from 'goober';
import { h } from '~/qx';

const cssEditMenuBar = css`
  display: flex;
  > * + * {
    margin-left: 5px;
  }
  button {
    width: 50px;
    padding: 5px;
    cursor: pointer;
  }
`;

export const EditMenuBar = () => {
  return (
    <div class={cssEditMenuBar}>
      <button>undo</button>
      <button>redo</button>
    </div>
  );
};
