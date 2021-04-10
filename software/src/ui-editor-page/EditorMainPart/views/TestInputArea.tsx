import { jsx, css } from 'qx';
import { useLocal } from '~/ui-common';
import { GeneralButton, GeneralInput } from '~/ui-common/components';
import { makeTestInputAreaViewModel } from '~/ui-editor-page/TestInputArea/TestInputAreaViweModel';

const cssTestInputArea = css`
  margin: 5px;
  display: flex;
`;

export const TestInputArea__Deprecated = () => {
  const vm = useLocal(makeTestInputAreaViewModel);
  return (
    <div css={cssTestInputArea}>
      <GeneralInput value={vm.text} setValue={vm.setText} width={300} />
      <GeneralButton text="clear" onClick={vm.clearText} />
    </div>
  );
};
