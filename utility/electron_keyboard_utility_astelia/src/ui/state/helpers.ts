export function getAssignSlotAddress(
  keyUnitId: string,
  layerId: string,
  isPrimary: boolean
) {
  const priority = isPrimary ? 'pri' : 'sec';
  return `${keyUnitId}.${layerId}.${priority}`;
}
