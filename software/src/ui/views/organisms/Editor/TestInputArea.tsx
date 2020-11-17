import { css } from 'goober';
import { h, Hook } from '~lib/qx';
import { makeTestInputAreaViewModel } from '~ui/viewModels/TestInputAreaViweModel';
import { GeneralButton } from '~ui/views/controls/GeneralButton';
import { GeneralInput } from '~ui/views/controls/GeneralInput';

const cssTestInputArea = css`
  margin: 5px;
  display: flex;
`;

export const TestInputArea = () => {
  const vm = Hook.useLocal(makeTestInputAreaViewModel);
  return (
    <div css={cssTestInputArea}>
      <GeneralInput value={vm.text} setValue={vm.setText} width={300} />
      <GeneralButton text="clear" handler={vm.clearText} />
    </div>
  );
};
