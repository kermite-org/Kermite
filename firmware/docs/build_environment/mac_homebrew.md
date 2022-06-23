
## Example of building an environment on MacOS

The following steps have been confirmed on MacOS 10.15 Catalina.

### Make, GCC
 Make and GCC are included in OS by default, so we use them as they are.

### arm-none-eabi-gcc
Use https://github.com/ARMmbed/homebrew-formulae.
```
$ brew tap ArmMbed/homebrew-formulae
$ brew install arm-none-eabi-gcc
```

### Check the build.

Open a terminal in Kermite/firmware.


Make sure that each tool is available by using commands like

```
$ make -v
$ g++ -v
$ arm-none-eabi-gcc -v
$ avrdude -v
```


Make sure you can build the project with commands like
```
$ make proto/standard:rp:build
```

