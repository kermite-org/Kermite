import { cloneObject } from '~/shared';
import { appUi } from '~/ui/base';
import { modalError } from '~/ui/components';
import {
  diKicadImporter,
  fallbackPcbShapeData,
  IFootprintDisplayMode,
  IPcbShapeData,
} from '../base';
import { fileDialogHelpers_loadLocalTextFileWithDialog } from '../funcs';
import { kicadFileContentLoader } from '../loaders';
import {
  footprintSeeker_findDefaultFootprintSearchWord,
  keyboardDesignBuilder_convertPcbShapeDataToPersistKeyboardDesign,
} from '../modules';
import { kicadPcbTestData_sp2104 } from './testData';

function createKicadImporterStore() {
  const state = {
    pcbShapeData: cloneObject(fallbackPcbShapeData),
    footprintSearchWord: '',
    footprintDisplayMode: 'rect14x14' as IFootprintDisplayMode,
  };

  const internalActions = {
    loadPcbFileContent(text: string) {
      let pcbShapeData: IPcbShapeData;
      try {
        pcbShapeData = kicadFileContentLoader.loadKicadPcbFileContent(text);
      } catch (error) {
        console.error(error);
        modalError(`an error occurred while loading file`);
        return;
      }
      console.log({ pcbShapeData });
      state.pcbShapeData = pcbShapeData;
      state.footprintSearchWord =
        footprintSeeker_findDefaultFootprintSearchWord(pcbShapeData);
      appUi.rerender();
    },
  };

  const readers = {
    get filteredFootprints() {
      const { pcbShapeData, footprintSearchWord } = state;
      return pcbShapeData.footprints.filter((it) =>
        it.footprintName.toLowerCase().includes(footprintSearchWord),
      );
    },
    get numFootprintsMatched() {
      return readers.filteredFootprints.length;
    },
  };

  const actions = {
    async loadKicadPcbFile() {
      const res = await fileDialogHelpers_loadLocalTextFileWithDialog(
        '.kicad_pcb',
      );
      if (res) {
        internalActions.loadPcbFileContent(res.contentText);
      }
    },
    loadTestData() {
      internalActions.loadPcbFileContent(kicadPcbTestData_sp2104);
    },
    setFootprintSearchWord(word: string) {
      state.footprintSearchWord = word;
    },
    setFootprintDisplayMode(mode: IFootprintDisplayMode) {
      state.footprintDisplayMode = mode;
    },
    applyImportLayout() {
      const {
        pcbShapeData: { boundingBox, outlines },
      } = state;
      const { filteredFootprints: footprints } = readers;
      const design =
        keyboardDesignBuilder_convertPcbShapeDataToPersistKeyboardDesign({
          outlines,
          boundingBox,
          footprints,
        });
      diKicadImporter.applyImportLayout(design);
    },
  };

  return { state, readers, actions };
}

export const kicadImporterStore = createKicadImporterStore();
