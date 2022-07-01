import { copyObjectProps } from '~/shared';

interface IKmsColors {
  keyEdge: string;
  shapeEdge: string;
  layerButton: string;
  keyText: string;
  layerButtonText: string;
  pageText: string;
  pageBackground: string;
}

export const kmsColors: IKmsColors = {
  keyEdge: '#8fc13e',
  shapeEdge: '#5560bf',
  layerButton: '#fd3',
  keyText: '#222',
  layerButtonText: '#222',
  pageBackground: '#fff',
  pageText: '#222',
};

const kmsColorsDark: Partial<IKmsColors> = {
  pageBackground: '#263858',
  pageText: '#fff',
  keyText: '#fff',
  layerButtonText: '#fff',
  shapeEdge: '#42a5f5',
  layerButton: '#09B',
};

if (location.search.includes('theme=dark')) {
  copyObjectProps(kmsColors, kmsColorsDark);
}
