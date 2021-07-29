import { jsx, css, FC } from 'qx';
import { editReader } from '~/ui/pages/layouter/models';
import { DesignConfigurationPanel } from '~/ui/pages/layouter/views/sidePanels/organisms/DesignConfigurationPanel';
import { KeyEntityEditPanel } from '~/ui/pages/layouter/views/sidePanels/organisms/KeyEntityEditPanel';
import { OutlineEditPanel } from '~/ui/pages/layouter/views/sidePanels/organisms/OutlineEditPanel';
import { TransGroupEditPanel } from '~/ui/pages/layouter/views/sidePanels/organisms/TransGroupEditPanel';

export const EditorSideColumnContent: FC = () => {
  const { editMode, currentKeyEntity, currentOutlinePoint } = editReader;

  const isKeyPanelVisible = editMode === 'key' || !!currentKeyEntity;
  const isShapePanelVisible = editMode === 'shape' || !!currentOutlinePoint;
  return (
    <div css={style}>
      <DesignConfigurationPanel />
      {/* {editorTarget === 'key' && <KeyEntityEditPanel />}
      {editorTarget === 'outline' && <OutlineEditPanel />} */}
      {/* KeyEntityEditPanelやOutlineEditPanelのinputにフォーカスがある状態でパネル表示が切り替わったときにpetit-dom内部で例外が発生する */}
      {/* デバッグしても原因がわからないため、非表示の場合にDOMから要素を除去せず display:noneにすることで暫定的に対処 */}
      <div style={(!isKeyPanelVisible && { display: 'none' }) || undefined}>
        <KeyEntityEditPanel />
      </div>
      <div style={(!isShapePanelVisible && { display: 'none' }) || undefined}>
        <OutlineEditPanel />
      </div>
      <TransGroupEditPanel />
    </div>
  );
};

const style = css`
  > :not(:first-child) {
    margin-top: 5px;
  }
`;
