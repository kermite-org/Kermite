export function generateRandomUid(): string {
  //generate guid like identification string
  return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/x/g, m =>
    ((Math.random() * 16) >> 0).toString(16)
  );
}
