interface IChunkSpan {
  address: number;
  size: number;
}

const enum SubChunkSig {
  ProfileDataHeader = 0xbb71,
  ProfileSettings = 0xbb72,
  ProfileLayerList = 0xbb74,
  MappingEntries = 0xbb76,
  ProfileKeyAssigns = 0xbb78,
}

class DataStorage {
  // binaryProfileDataチャンクの内容を保持するバイト列
  dataBytes: number[] = [];

  writeBinaryProfileData(data: number[]) {
    this.dataBytes = data;
  }

  readByte(pos: number): number {
    return this.dataBytes[pos];
  }

  private readWord(pos: number): number {
    const a = this.dataBytes[pos];
    const b = this.dataBytes[pos + 1];
    return (b << 8) | a;
  }

  private seekChunk(chunkSig: number): IChunkSpan {
    const posStart = 0;
    const posEnd = this.dataBytes.length;
    let pos: number = posStart;
    while (pos < posEnd) {
      const head = this.readWord(pos);
      const size = this.readWord(pos + 2);
      if (head === chunkSig) {
        pos += 4;
        return { address: pos, size };
      } else if (size === 0) {
        break;
      } else {
        pos += 4 + size;
      }
    }
    return { address: 0, size: 0 };
  }

  getChunk_profileHeader(): IChunkSpan {
    return this.seekChunk(SubChunkSig.ProfileDataHeader);
  }

  getChunk_profileSettings(): IChunkSpan {
    return this.seekChunk(SubChunkSig.ProfileSettings);
  }

  getChunk_layerList(): IChunkSpan {
    return this.seekChunk(SubChunkSig.ProfileLayerList);
  }

  getChunk_mappingEntries(): IChunkSpan {
    return this.seekChunk(SubChunkSig.MappingEntries);
  }

  getChunk_keyAssigns(): IChunkSpan {
    return this.seekChunk(SubChunkSig.ProfileKeyAssigns);
  }
}

export const dataStorage = new DataStorage();
