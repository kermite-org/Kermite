import * as edge from 'electron-edge-js';
import * as path from 'path';

const api_keybd_event = edge.func(path.join(__dirname, 'keybd_event.cs'));

export function callApiKeybdEvent(virtualKeyCode: number, isDown: boolean) {
  const bVk = virtualKeyCode;
  const bScan = 0;
  const dwFlags = isDown ? 0 : 2;
  const dwExtraInfo = 0;
  api_keybd_event(
    { bVk, bScan, dwFlags, dwExtraInfo },
    (error: any, result: any) => {
      if (error) throw error;
    }
  );
}
