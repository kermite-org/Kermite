# Configuration that pollutes the OS environment as little as possible

The basic configuration is the same as [win1_default](./win1_default.md), except that only Make is added to PATH, instead of all tools, to prevent contamination of the development environment.
## What to add to PATH in OS preferences
* Make for Windows
## Tools to be used by specifying the PATH in Makefile
* AVR-GCC
* arm-none-eabi-gcc
* GOW (or CoreUtils)
* MinGW

Install GNU Make globally and add PATH to it, and refer to the other tools only from within the Makefile without to add to PATH them. Of the tools to be added, make should be the only one that can be called directly from the command prompt.
Consider this configuration if you do not want to affect the build environment of other projects.
## Tools installation
### Make for Windows
| Tools | [Make for Windows](http://gnuwin32.sourceforge.net/packages/make.htm)    
| -------- | :------------------------------------------ | 
| file | make-3.81.exe | 
| How to install - DL, install, add bin to PATH

Get and install Make for Windows. Use the installer.

### Software other than Make
For the installation procedure of tools other than Make, see [win1_default](./win1_default.md), but without the PATH setting.
Since CoreUtils and Make of GnuWin32 are installed in the same folder, you may want to separate the installation folders or use GOW instead without installing CoreUtils.

## Specify the PATH in the Makefile
Copy Makefile.user.example to create Makefile.user.
Makefile.user is for writing user environment specific settings, etc. that will be loaded from the main Makefile at build time.

At the top of the file, overwrite the environment variable PATH with the following statement.
```
export PATH:=$(PATH);<path to add1>;<path to add2>;...
```