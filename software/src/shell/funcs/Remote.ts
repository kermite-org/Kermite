// import fetch from 'node-fetch';
import { AppError } from '~/shared';

export async function fetchJson(uri: string): Promise<any> {
  console.log(`fetching ${uri}`);
  try {
    const res = await fetch(uri);
    if (res.status !== 200) {
      throw new Error(`api error, status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    throw new AppError('FailedToLoadRemoteResource', { url: uri }, error);
  }
}

export async function fetchText(uri: string): Promise<string> {
  console.log(`fetching ${uri}`);
  try {
    const res = await fetch(uri);
    return await res.text();
  } catch (error) {
    throw new AppError('FailedToLoadRemoteResource', { url: uri }, error);
  }
}

export async function fetchBinary(uri: string): Promise<Uint8Array> {
  console.log(`fetching ${uri}`);
  try {
    const res = await fetch(uri);
    const data = await res.arrayBuffer();
    return new Uint8Array(data);
  } catch (error) {
    throw new AppError('FailedToLoadRemoteResource', { url: uri }, error);
  }
}

const cached: { [key in string]: Promise<any> } = {};
export async function cacheRemoteResource<T>(
  func: (uri: string) => Promise<T>,
  uri: string,
): Promise<T> {
  if (!cached[uri]) {
    cached[uri] = func(uri);
  }
  return await cached[uri];
}
