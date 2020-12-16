import { IKeyboardDesign } from '~/editor/DataSchema';

const initialDesign: IKeyboardDesign = {
  keyEntities: [
    {
      id: 'key0',
      x: 0,
      y: 0,
    },
    {
      id: 'key1',
      x: 22,
      y: 0,
    },
    {
      id: 'key2',
      x: 44,
      y: 0,
    },
  ],
};

export const store = {
  design: initialDesign,
  currentkeyId: 'key0',
};
