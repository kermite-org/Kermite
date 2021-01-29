import { css } from 'goober';
import { Hook, h } from 'qx';
import { GeneralButton } from '~/ui-common/parts/controls/GeneralButton';
import { GeneralInput } from '~/ui-common/parts/controls/GeneralInput';
import { makeTestInputAreaViewModel } from '~/ui-root/zones/editor/TestInputAreaViweModel';

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
