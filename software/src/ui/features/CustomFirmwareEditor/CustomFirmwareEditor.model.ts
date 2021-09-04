export type ICustomFirmwareSetupModalEditValues = {
  variationName: string;
  customFirmwareId: string;
};

const store = new (class {
  editValues: ICustomFirmwareSetupModalEditValues = {
    variationName: '',
    customFirmwareId: '',
  };
})();

const readers = {
  get editValues() {
    return store.editValues;
  },
};

const actions = {
  loadEditValues(editValues: ICustomFirmwareSetupModalEditValues) {
    store.editValues = editValues;
  },
};

export const CustomFirmwareEditorModel = {
  readers,
  actions,
};
