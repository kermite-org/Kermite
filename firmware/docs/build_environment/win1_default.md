
## Setup the build environment in Windows

## Install the tools

Install the following tools. Please get the files and add PATH to them respectively.
The names of the files are as of May 2021. If the version has been updated, please choose the newer one.
### AVR-GCC, Make, etc.
| Tools | [AVR-GCC 11.1.0 for Windows 32 and 64 bit](https://blog.zakkemble.net/avr-gcc-builds/) 
| -------- | :------------------------------------------ | 
| file | avr-gcc-11.1.0-x64-windows.zip | 
| How to install | DL, unzip, add bin to PATH 

Use the AVR-GCC binary for Windows provided on Zak Kemble's blog, which includes a complete set of tools for AVR development, including Make, avr-gcc, and avrdude.

### GNU ARM Toolchain
| Tools | [GNU Arm Embedded Toolchain](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu) | 
| -------- | :------------------------------------------ | 
| file | gcc-arm-none-eabi-10-2020-q4-major-win32.zip | 
| How to install | DL, unzip, add bin to PATH

Download and install the compiler from the official ARM website.

### CoreUtils for Windows
| Tools | [CoreUtils for Windows](http://gnuwin32.sourceforge.net/packages/coreutils.htm) 
| -------- | :------------------------------------------ | 
| File | coreutils-5.3.0.exe 
| How to install | DL, install, add bin to PATH

Install Unix compatible commands such as `rm` and `mkdir` as they are required.
After installing with the installer, add PATH to `C:\Program Files\GnuWin32\bin`.

(*)You can also use [GOW](https://github.com/bmatzelle/gow) instead of CoreUtils.


### MinGW
| tools | [mingw-w64](http://mingw-w64.org/doku.php/download) |
| -------- | :------------------------------------------ | 
| File | mingw-w64-install.exe 
| How to install | DL, install, add bin to PATH

This is required if you are building firmware for the RP2040; it is not required for the AVR.
On the linked site, follow the link from 'MingW-W64-builds' to download the file.
On the option setting screen that comes up during installation, set `x86_64` for Architecture. You can leave the other options as default.
Once installed, add PATH to `C:\Program Files\mingw-w64\<version>\mingw64\bin`.

## Check the build.

Open a command prompt in `Kermite/firmware`.

Make sure that each tool is available by using commands like

```
> where make
> where mkdir.exe
> where rm.exe
> make -v
> avr-gcc -v
> arm-none-eabi-gcc -v
> g++ -v
> avrdude -v
```

Make sure that you can build the project with commands like

```
> make clean
> make astelia:atmega:build
> make proto/minivers:rev2_rp:build
```


