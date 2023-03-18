export type IFileReadHandle = {
  fileName: string;
  contentText: string;
};

function checkFileNameExtension(fileName: string, extension: string) {
  if (!fileName.endsWith(extension) || fileName.match(/\..*\./)) {
    throw new Error('invalid file extension');
  }
}

export async function fileDialogHelpers_loadLocalTextFileWithDialog(
  extension: string,
): Promise<IFileReadHandle | undefined> {
  return await new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = extension;
    input.addEventListener('change', (e) => {
      const file = (e.currentTarget as HTMLInputElement)?.files?.[0];
      if (file) {
        const fileName = file.name;
        try {
          checkFileNameExtension(fileName, extension);
        } catch (error) {
          alert(error);
          reject();
        }
        const fileReader = new FileReader();
        fileReader.readAsText(file, 'utf-8');
        fileReader.addEventListener('load', () => {
          const contentText = fileReader.result as string;
          resolve({ fileName, contentText });
        });
      } else {
        reject();
      }
    });
    input.click();
  });
}
