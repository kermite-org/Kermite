import { checkArrayItemsUnique, cloneObject } from '~/shared';
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

function createKicadImporterStore() {
  const state = {
    pcbShapeData: cloneObject(fallbackPcbShapeData),
    footprintSearchWord: '',
    footprintDisplayMode: 'rect14x14' as IFootprintDisplayMode,
    dataLoaded: false,
  };

  const internalActions = {
    loadPcbFileContent(text: string) {
      let pcbShapeData: IPcbShapeData;
      try {
        pcbShapeData = kicadFileContentLoader.loadKicadPcbFileContent(text);

        const referenceNames = pcbShapeData.footprints.map(
          (it) => it.referenceName,
        );
        if (
          referenceNames.includes('') ||
          referenceNames.includes(undefined as any)
        ) {
          throw new Error(`invalid reference name`);
        }
        if (!checkArrayItemsUnique(referenceNames)) {
          throw new Error(`reference name duplication`);
        }
      } catch (error) {
        console.error(error);
        modalError(`an error occurred while loading file`);
        return;
      }
      console.log({ pcbShapeData });
      if (
        pcbShapeData.outlines.length > 0 ||
        pcbShapeData.footprints.length > 0
      ) {
        state.pcbShapeData = pcbShapeData;
        state.footprintSearchWord =
          footprintSeeker_findDefaultFootprintSearchWord(pcbShapeData);
        state.dataLoaded = true;
      }
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
    reset() {
      state.pcbShapeData = cloneObject(fallbackPcbShapeData);
      state.footprintSearchWord = '';
      state.dataLoaded = false;
    },
    async loadKicadPcbFile() {
      const res = await fileDialogHelpers_loadLocalTextFileWithDialog(
        '.kicad_pcb',
      );
      if (res) {
        internalActions.loadPcbFileContent(res.contentText);
        appUi.rerender();
      }
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
