import { css, FC, jsx, useLocal } from 'alumina';
import { texts } from '~/ui/base';
import { GeneralInput, GeneralButton } from '~/ui/components';
import { makeTestInputAreaViewModel } from '~/ui/featureEditors/profileEditor/ui_bar_testInputArea/testInputAreaViewModel';

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
