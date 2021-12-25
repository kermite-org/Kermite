import { jsx } from 'alumina';
import { DisplayKeyboardDesignLoader } from '~/shared';
import { exampleData_persistKeyboardDesign_astelia } from '~/ui/constants';
import { ProjectKeyboardShapeView } from '~/ui/elements/keyboard/panels/ProjectKeyboardShapeView';

const design = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
  exampleData_persistKeyboardDesign_astelia,
);

export default {
  default: () => (
    <div style="width: 200px; height: 150px; border: solid 1px #AAA">
      <ProjectKeyboardShapeView keyboardDesign={design} />
    </div>
  ),
};
