import { css } from 'goober';
import { h } from 'qx';
import { useLocal } from '~/ui-common';
import { GeneralButton } from '~/ui-common/sharedViews/controls/GeneralButton';
import { GeneralInput } from '~/ui-common/sharedViews/controls/GeneralInput';
import { makeTestInputAreaViewModel } from '~/ui-editor-page/TestInputArea/TestInputAreaViweModel';

const cssTestInputArea = css`
  margin: 5px;
  display: flex;
`;

export const TestInputArea = () => {
  const vm = useLocal(makeTestInputAreaViewModel);
  return (
    <div css={cssTestInputArea}>
      <GeneralInput value={vm.text} setValue={vm.setText} width={300} />
      <GeneralButton text="clear" handler={vm.clearText} />
    </div>
  );
};
