import { css, FC, jsx, useLocal } from 'alumina';
import { texts } from '~/app-shared';
import { GeneralInput, GeneralButton } from '~/fe-shared';
import { makeTestInputAreaViewModel } from './testInputAreaViewModel';

export const TestInputArea: FC = () => {
  const vm = useLocal(makeTestInputAreaViewModel);
  return (
    <div class={style}>
      <GeneralInput
        value={vm.text}
        setValue={vm.setText}
        width={300}
        hint={texts.assignerTestInputAreaHint.inputField}
      />
      <GeneralButton
        text={texts.assignerTestInputArea.clearButton}
        hint={texts.assignerTestInputAreaHint.clearButton}
        onClick={vm.clearText}
      />
    </div>
  );
};

const style = css`
  margin: 5px;
  display: flex;
`;
