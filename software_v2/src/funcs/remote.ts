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
