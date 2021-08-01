import { jsx } from 'qx';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { ProjectKeyboardShapeView } from '~/ui/components/keyboard/panels/ProjectKeyboardShapeView';
import { exampleData_persistKeyboardDesign_astelia } from '~/ui/exampleData';

const design = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
  exampleData_persistKeyboardDesign_astelia,
);

export const ProjectKeyboardShapeViewExamples = {
  default: () => (
    <div style="width: 200px; height: 150px; border: solid 1px #AAA">
      <ProjectKeyboardShapeView keyboardDesign={design} />
    </div>
  ),
};
