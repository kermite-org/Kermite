import { Hook, jsx, css } from 'qx';
import { texts } from '~/ui/common';
import { GeneralButton, GeneralInput } from '~/ui/common/components';
import { makeTestInputAreaViewModel } from '~/ui/editor-page/TestInputArea/TestInputAreaViweModel';

const cssTestInputArea = css`
  margin: 5px;
  display: flex;
`;

export const TestInputArea = () => {
  const vm = Hook.useMemo(makeTestInputAreaViewModel, []);
  return (
    <div css={cssTestInputArea}>
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
