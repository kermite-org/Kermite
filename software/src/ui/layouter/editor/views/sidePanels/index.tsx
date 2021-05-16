import { jsx, css } from 'qx';
import { editReader } from '~/ui/layouter/editor/store';
import { DesignConfigurationPanel } from '~/ui/layouter/editor/views/sidePanels/organisms/DesignConfigurationPanel';
import { KeyEntityEditPanel } from '~/ui/layouter/editor/views/sidePanels/organisms/KeyEntityEditPanel';
import { OutlineEditPanel } from '~/ui/layouter/editor/views/sidePanels/organisms/OutlineEditPanel';
import { TransGroupEditPanel } from '~/ui/layouter/editor/views/sidePanels/organisms/TransGroupEditPanel';

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
