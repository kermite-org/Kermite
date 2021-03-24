import { getArrayDiff } from '~/shared';
import { ComPortsResource } from './ComPortsResource';

export class ComPortsMonitor {
  private comPortNames: string[] = [];
  private iterationCount: number = 0;
  private detectedComPortName: string | undefined;

  resetDeviceDetectionStatus() {
    this.comPortNames = [];
    this.iterationCount = 0;
    this.detectedComPortName = undefined;
  }

  async updateDeviceDetection() {
    const allComPortNames = await ComPortsResource.getComPortNames();

    if (this.iterationCount > 0) {
      const [added, removed] = getArrayDiff(this.comPortNames, allComPortNames);

      if (removed.length > 0) {
        this.detectedComPortName = undefined;
      }
      if (added.length > 0) {
        this.detectedComPortName = added[0];
      }
    }
    this.comPortNames = allComPortNames;
    this.iterationCount++;
    return this.detectedComPortName;
  }
}
