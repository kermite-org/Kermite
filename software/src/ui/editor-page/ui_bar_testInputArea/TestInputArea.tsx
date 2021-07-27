import { css, jsx, useLocal } from 'qx';
import { GeneralButton, GeneralInput, texts } from '~/ui/common';
import { makeTestInputAreaViewModel } from '~/ui/editor-page/ui_bar_testInputArea/TestInputAreaViewModel';

const cssTestInputArea = css`
  margin: 5px;
  display: flex;
`;

export const TestInputArea = () => {
  const vm = useLocal(makeTestInputAreaViewModel);
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
