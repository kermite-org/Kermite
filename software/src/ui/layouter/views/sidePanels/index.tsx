import { jsx, css } from 'qx';
import { editReader } from '~/ui/layouter/models';
import { DesignConfigurationPanel } from '~/ui/layouter/views/sidePanels/organisms/DesignConfigurationPanel';
import { KeyEntityEditPanel } from '~/ui/layouter/views/sidePanels/organisms/KeyEntityEditPanel';
import { OutlineEditPanel } from '~/ui/layouter/views/sidePanels/organisms/OutlineEditPanel';
import { TransGroupEditPanel } from '~/ui/layouter/views/sidePanels/organisms/TransGroupEditPanel';

const cssEditorSideColumnContent = css`
  > :not(:first-child) {
    margin-top: 5px;
  }
`;

export const EditorSideColumnContent = () => {
  const { editorTarget } = editReader;
  return (
    <div css={cssEditorSideColumnContent}>
      <DesignConfigurationPanel />
      {/* {editorTarget === 'key' && <KeyEntityEditPanel />}
      {editorTarget === 'outline' && <OutlineEditPanel />} */}
      {/* KeyEntityEditPanelやOutlineEditPanelのinputにフォーカスがある状態でパネル表示が切り替わったときにpetit-dom内部で例外が発生する */}
      {/* デバッグしても原因がわからないため、非表示の場合にDOMから要素を除去せず display:noneにすることで暫定的に対処 */}
      <div style={(!(editorTarget === 'key') && { display: 'none' }) || {}}>
        <KeyEntityEditPanel />
      </div>
      <div style={(!(editorTarget === 'outline') && { display: 'none' }) || {}}>
        <OutlineEditPanel />
      </div>
      <TransGroupEditPanel />
    </div>
  );
};
