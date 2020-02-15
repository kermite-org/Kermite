using System.Runtime.InteropServices;
using System.Threading.Tasks;

using System;

public class Startup
{
    [DllImport("user32.dll")]
    public static extern uint keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    public async Task<object> Invoke(dynamic args)
    {
			keybd_event( (byte)(args.bVk), (byte)(args.bScan), (uint)args.dwFlags, (UIntPtr)args.dwExtraInfo);
      return null;
    }
}