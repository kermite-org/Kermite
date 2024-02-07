function creteLogStorage() {
  const storageKey = `kermite_debug_log_storage`;

  type ILogStorageObject = {
    revision: number;
    message: string;
  };

  const m = {
    read(): ILogStorageObject {
      const text = localStorage.getItem(storageKey);
      if (text) {
        try {
          const obj = JSON.parse(text);
          return obj;
        } catch (_) {}
      }
      return { revision: 0, message: 'initial data' };
    },
    write(message: string) {
      const obj = m.read();
      const newObj: ILogStorageObject = { revision: obj.revision + 1, message };
      localStorage.setItem(storageKey, JSON.stringify(newObj));
    },
  };

  return {
    show() {
      const obj = m.read();
      console.log(`logStorage, ${obj.revision}: ${obj.message}`);
    },
    write(message: string) {
      m.write(message);
    },
  };
}

export const logStorage = creteLogStorage();
