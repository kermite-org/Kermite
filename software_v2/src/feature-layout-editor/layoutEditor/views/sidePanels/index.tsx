import { FC, css, jsx } from 'alumina';
import { editReader } from '../../models';
import {
  DesignConfigurationPanel,
  KeyEntityEditPanel,
  OutlineEditPanel,
  TransGroupEditPanel,
} from './organisms';
import { ExtraShapeEditPanel } from './organisms/ExtraShapeEditPanel';

export const EditorSideColumnContent: FC = () => {
  const { editMode, currentKeyEntity, currentOutlinePoint } = editReader;

  const isExShapeMode = editMode === 'shape_ex';

  const isKeyPanelVisible =
    (editMode === 'key' || !!currentKeyEntity) && !isExShapeMode;
  const isShapePanelVisible =
    (editMode === 'shape' || !!currentOutlinePoint) && !isExShapeMode;

  const isExtraShapePanelVisible = isExShapeMode;

  return (
    <div class={style}>
      <DesignConfigurationPanel />
      {/* {isKeyPanelVisible && <KeyEntityEditPanel />}
      {isShapePanelVisible && <OutlineEditPanel />} */}
      {/* KeyEntityEditPanelやOutlineEditPanelのinputにフォーカスがある状態でパネル表示が切り替わったときに仮想DOM内部で例外が発生する */}
      {/* デバッグしても原因がわからないため、非表示の場合にDOMから要素を除去せず display:noneにすることで暫定的に対処 */}
      <div style={(!isKeyPanelVisible && { display: 'none' }) || undefined}>
        <KeyEntityEditPanel />
      </div>
      <div style={(!isShapePanelVisible && { display: 'none' }) || undefined}>
        <OutlineEditPanel />
      </div>
      <div
        style={(!isExtraShapePanelVisible && { display: 'none' }) || undefined}
      >
        <ExtraShapeEditPanel />
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
