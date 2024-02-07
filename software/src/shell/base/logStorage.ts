function creteLogStorage() {
  const storageKey = `kermite_debug_log_storage`;

  type ILogStorageItem = {
    revision: number;
    message: string;
  };

  type ILogStorageObject = {
    items: ILogStorageItem[];
  };

  const m = {
    read(): ILogStorageObject {
      const text = localStorage.getItem(storageKey);
      if (text) {
        try {
          const obj = JSON.parse(text);
          if (obj.items) {
            return obj;
          }
        } catch (_) {}
      }
      return { items: [{ revision: 0, message: 'initial data' }] };
    },
    write(message: string) {
      const obj = m.read();
      const newItem: ILogStorageItem = {
        revision: obj.items[0].revision + 1,
        message,
      };
      const newObj: ILogStorageObject = {
        items: [newItem, ...obj.items].slice(0, 5),
      };
      localStorage.setItem(storageKey, JSON.stringify(newObj));
    },
  };

  return {
    show() {
      const obj = m.read();
      for (const item of obj.items) {
        console.log(`logStorage, ${item.revision}: ${item.message}`);
      }
    },
    write(message: string) {
      m.write(message);
    },
  };
}

export const logStorage = creteLogStorage();
