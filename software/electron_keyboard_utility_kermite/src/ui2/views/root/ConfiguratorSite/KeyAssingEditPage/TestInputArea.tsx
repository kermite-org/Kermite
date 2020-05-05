import { css } from 'goober';
import { hx } from '~ui2/views/basis/qx';
import { createClosureComponent } from '~ui2/views/basis/qxUtils';
import { reflectValue } from '~ui2/views/common/FormHelpers';

export const TestInputArea = createClosureComponent(() => {
  let text = '';
  const setText = (value: string) => (text = value);
  const clearText = () => (text = '');

  const cssInput = css`
    width: 300px;
  `;
  const cssButton = css`
    padding: 0 4px;
  `;

  return () => (
    <div>
      <input
        type="text"
        css={cssInput}
        value={text}
        onChange={reflectValue(setText)}
      />
      <button css={cssButton} onClick={clearText}>
        clear
      </button>
    </div>
  );
});
