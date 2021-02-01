export async function fetchJson(uri: string): Promise<any> {
  console.log(`fetching ${uri}`);
  const res = await fetch(uri);
  return await res.json();
}

export async function fetchText(uri: string): Promise<string> {
  console.log(`fetching ${uri}`);
  const res = await fetch(uri);
  return await res.text();
}

const cached: { [key in string]: any } = {};
export async function cacheRemoteResouce<T>(
  func: (uri: string) => Promise<T>,
  uri: string,
): Promise<T> {
  if (!cached[uri]) {
    cached[uri] = await func(uri);
  }
  return cached[uri];
}
