import { IKeyboardDesign } from '~/editor/DataSchema';

const initialDesign: IKeyboardDesign = {
  keyEntities: [
    {
      id: 'jFR1eLdvkUSY9M65cmyAIQ',
      keyId: 'key0',
      x: 0,
      y: 0,
    },
    {
      id: 'dNpoO1Uu_ECWZNCi4G8wyw',
      keyId: 'key1',
      x: 22,
      y: 0,
    },
    {
      id: 'athTNtYrwUmfDRqzyK1yrg',
      keyId: 'key2',
      x: 44,
      y: 0,
    },
  ],
};

interface IStore {
  design: IKeyboardDesign;
  currentkeyEntityId: string | undefined;
}
export const store: IStore = {
  design: initialDesign,
  currentkeyEntityId: 'jFR1eLdvkUSY9M65cmyAIQ',
};
