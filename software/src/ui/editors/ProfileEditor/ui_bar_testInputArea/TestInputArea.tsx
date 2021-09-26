import { css, FC, jsx, useLocal } from 'qx';
import { texts } from '~/ui/base';
import { GeneralInput, GeneralButton } from '~/ui/components';
import { makeTestInputAreaViewModel } from '~/ui/editors/ProfileEditor/ui_bar_testInputArea/TestInputAreaViewModel';

export const TestInputArea: FC = () => {
  const vm = useLocal(makeTestInputAreaViewModel);
  return (
    <div css={style}>
      <GeneralInput
        value={vm.text}
        setValue={vm.setText}
        width={300}
        hint={texts.hint_assigner_testInputArea_inputField}
      />
      <GeneralButton
        text={texts.label_assigner_testInputArea_clearButton}
        hint={texts.hint_assigner_testInputArea_clearButton}
        onClick={vm.clearText}
      />
    </div>
  );
};

const style = css`
  margin: 5px;
  display: flex;
`;
