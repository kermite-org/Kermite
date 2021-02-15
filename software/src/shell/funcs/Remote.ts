import fetch from 'node-fetch';
import { wrappedError } from '~/shared';

export async function fetchJson(uri: string): Promise<any> {
  console.log(`fetching ${uri}`);
  try {
    const res = await fetch(uri);
    return await res.json();
  } catch (error) {
    throw wrappedError(`failed to fetch remote resource: ${uri}`, error);
  }
}

export async function fetchText(uri: string): Promise<string> {
  console.log(`fetching ${uri}`);
  try {
    const res = await fetch(uri);
    return await res.text();
  } catch (error) {
    throw wrappedError(`failed to fetch remote resource: ${uri}`, error);
  }
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
