export async function fetchJson(uri: string): Promise<any> {
  console.log(`fetching ${uri}`);
  try {
    const res = await fetch(uri);
    if (res.status !== 200) {
      throw new Error(`api error, status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    throw new Error(`failed to load remote resource ${uri}`);
  }
}

const fetchJsonCached__cachedRequests: { [key in string]: Promise<any> } = {};
export async function fetchJsonCached(uri: string): Promise<any> {
  if (!fetchJsonCached__cachedRequests[uri]) {
    fetchJsonCached__cachedRequests[uri] = fetchJson(uri);
  }
  return await fetchJsonCached__cachedRequests[uri];
}
