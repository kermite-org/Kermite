export const featureConfig = {
  // useFileSystemAccessApiForSaving: false,
  useFileSystemAccessApiForSaving: true,
  selectPrimarySlotOnKeySelectionChange: false,
  // selectPrimarySlotOnKeySelectionChange: true,
  debugFullFeatures:
    location.host.startsWith('localhost') ||
    location.search.includes('debugFullFeatures=1'),
};
