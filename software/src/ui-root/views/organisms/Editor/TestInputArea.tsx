import { css } from 'goober';
import { Hook, h } from 'qx';
import { makeTestInputAreaViewModel } from '~/ui-root/viewModels/TestInputAreaViweModel';
import { GeneralButton } from '~/ui-root/views/controls/GeneralButton';
import { GeneralInput } from '~/ui-root/views/controls/GeneralInput';

const cssTestInputArea = css`
  margin: 5px;
  display: flex;
`;

export const TestInputArea = () => {
  const vm = Hook.useMemo(makeTestInputAreaViewModel, []);
  return (
    <div css={cssTestInputArea}>
      <GeneralInput value={vm.text} setValue={vm.setText} width={300} />
      <GeneralButton text="clear" handler={vm.clearText} />
    </div>
  );
};
