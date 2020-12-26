import { css } from 'goober';
import { reflectValue } from '~/base/FormHelpers';
import { editMutations, editReader } from '~/editor/models';
import { h } from '~/qx';

class PlacementUnitEditViewModel {
  originalValue: string = '';
  editText: string = '';
  valid: boolean = false;

  onValueChanged = (text: string) => {
    const patterns = [
      /^mm$/,
      /^KP [0-9][0-9.]*$/,
      /^KP [0-9][0-9.]* [0-9][0-9.]*$/,
    ];

    this.editText = text;
    this.valid = patterns.some((p) => text.match(p));
  };

  onBlur = () => {
    if (this.valid) {
      editMutations.setPlacementUnit(this.editText);
    }
  };

  update(modelValue: string) {
    if (this.originalValue !== modelValue) {
      this.originalValue = modelValue;
      this.editText = this.originalValue;
      this.valid = true;
    }
  }
}

const vm = new PlacementUnitEditViewModel();

const PlacementUnitEditRow = () => {
  vm.update(editReader.design.placementUnit);

  return (
    <div>
      <div>
        <label>coord unit</label>
        <input
          type="text"
          value={vm.editText}
          onInput={reflectValue(vm.onValueChanged)}
          onBlur={vm.onBlur}
        />
      </div>
      <div>{!vm.valid && 'invalid unitSpec'}</div>
    </div>
  );
};

export const ConfigPanel = () => {
  const cssConfigPanel = css`
    padding: 10px;
    label {
      display: inline-block;
      width: 90px;
    }
    input {
      width: 100px;
    }
  `;

  return (
    <div css={cssConfigPanel}>
      <PlacementUnitEditRow />
    </div>
  );
};
