export const featureFlags = {
  allowEditLocalProject: false,
};
if (process.env.NODE_ENV === 'development') {
  console.log('feature flag allowEditLocalProject enabled');
  featureFlags.allowEditLocalProject = true;
}
