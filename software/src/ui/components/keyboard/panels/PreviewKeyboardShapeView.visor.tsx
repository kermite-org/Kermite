import { jsx } from 'qx';
import { DisplayKeyboardDesignLoader } from '~/shared';
import { PreviewKeyboardShapeView } from '~/ui/components/keyboard/panels/PreviewKeyboardShapeView';
import { exampleData_persistKeyboardDesign_astelia } from '~/ui/constants';

const design = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
  exampleData_persistKeyboardDesign_astelia,
);

export const PreviewKeyboardShapeViewExamples = {
  default: () => (
    <div style="width: 100%; height: 400px;">
      <PreviewKeyboardShapeView
        keyboardDesign={design}
        settings={{
          shapeViewShowKeyId: true,
          shapeViewShowKeyIndex: true,
          shapeViewShowBoundingBox: false,
        }}
      />
    </div>
  ),
};
