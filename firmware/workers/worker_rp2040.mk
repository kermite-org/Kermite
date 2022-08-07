-include Makefile.user

REL_PROJECT_CODE_DIR = $(PROJECT)/$(VARIATION)
PROJECT_CODE_DIR = src/projects/$(REL_PROJECT_CODE_DIR)
MODULES_DIR = src/modules

BUILD_DIR = build
OUT_DIR = build/$(REL_PROJECT_CODE_DIR)
OBJ_DIR = $(OUT_DIR)/obj
CORE_NAME = $(notdir $(PROJECT))_$(VARIATION)

DEFINES =
MODULE_SRCS = 
PROJECT_SRCS =
MODULE_PIOASM_SRCS =
PROJECT_PIOASM_SRCS =
PROJECT_STENCIL_SRCS =
-include $(PROJECT_CODE_DIR)/rules.mk

PROJECT_STENCIL_DIR :=
ifneq ($(TARGET_STENCIL),)
	PROJECT_STENCIL_DIR := src/projects/__stencils/$(TARGET_STENCIL)
	include $(PROJECT_STENCIL_DIR)/rules_rp2040.mk
endif

RELEASE_REVISION ?= 0
IS_RESOURCE_ORIGIN_ONLINE ?= 0

#--------------------

PICO_SDK_OUTER_DIR = deps/rp2040/pico_sdk_import
PICO_SDK_DIR = deps/rp2040/pico_sdk_import/pico_sdk
PICO_TOOLS_DIR = deps/rp2040/pico_sdk_import/pico_sdk_tools
PICO_LOCAL_DIR = deps/rp2040/pico_sdk_local
TINYUSB_DIR = deps/rp2040/pico_sdk_import/tinyusb
SHARED_OBJ_DIR = $(BUILD_DIR)/obj

ELF = $(OUT_DIR)/$(CORE_NAME).elf
BIN = $(OUT_DIR)/$(CORE_NAME).bin
HEX = $(OUT_DIR)/$(CORE_NAME).hex
DIS = $(OUT_DIR)/$(CORE_NAME).dis
LST = $(OUT_DIR)/$(CORE_NAME).lst
MAP = $(OUT_DIR)/$(CORE_NAME).map
UF2 = $(OUT_DIR)/$(CORE_NAME).uf2
PATCHED_UF2 = $(OUT_DIR)/$(CORE_NAME)_patched.uf2

CC = arm-none-eabi-gcc
AS = arm-none-eabi-gcc
LD = arm-none-eabi-g++
OBJCOPY = arm-none-eabi-objcopy
OBJDUMP = arm-none-eabi-objdump
OBJSIZE = arm-none-eabi-size

ELF2UF2_ROOT_DIR = $(PICO_TOOLS_DIR)/elf2uf2
ELF2UF2_BIN = $(ELF2UF2_ROOT_DIR)/build/elf2uf2

PIOASM_ROOT_DIR = $(PICO_TOOLS_DIR)/pioasm
PIOASM_BIN = $(PIOASM_ROOT_DIR)/build/pioasm

ifeq ($(OS),Windows_NT)
ELF2UF2_BIN = $(ELF2UF2_ROOT_DIR)/build/elf2uf2.exe
PIOASM_BIN = $(PIOASM_ROOT_DIR)/build/pioasm.exe
endif


#--------------------
#flags

DEFINES += CFG_TUSB_MCU=OPT_MCU_RP2040
DEFINES += CFG_TUSB_OS=OPT_OS_PICO
DEFINES += PICO_ON_DEVICE=1
DEFINES += PICO_NO_BINARY_INFO=0
DEFINES += PICO_NO_BI_BOOTSEL_VIA_DOUBLE_RESET
DEFINES += PICO_BOOTSEL_VIA_DOUBLE_RESET_TIMEOUT_MS=1000
DEFINES += KERMITE_TARGET_MCU_RP2040
DEFINES += EXTR_KERMITE_PROJECT_RELEASE_BUILD_REVISION=$(RELEASE_REVISION)
DEFINES += EXTR_KERMITE_IS_RESOURCE_ORIGIN_ONLINE=$(IS_RESOURCE_ORIGIN_ONLINE)
DEFINES += EXTR_KERMITE_VARIATION_NAME=\"$(VARIATION)\"

INC_PATHS =
INC_PATHS += -I$(PROJECT_CODE_DIR)
INC_PATHS += -I$(PICO_LOCAL_DIR)/include
INC_PATHS += -I$(MODULES_DIR)
INC_PATHS += -I$(PICO_SDK_OUTER_DIR)
INC_PATHS += -I$(PICO_SDK_DIR)/src/common/include
INC_PATHS += -I$(PICO_SDK_DIR)/src/rp2_common/include
INC_PATHS += -I$(PICO_SDK_DIR)/src/rp2040/include
INC_PATHS += -I$(TINYUSB_DIR)/src
INC_PATHS += -I$(TINYUSB_DIR)/src/common
INC_PATHS += -I$(PICO_SDK_DIR)/src/rp2_common/rp2040_usb_device_enumeration/include

ifneq ($(PROJECT_STENCIL_DIR),)
INC_PATHS += -I$(PROJECT_STENCIL_DIR)
endif

CORE_FLAGS = $(INC_PATHS) -march=armv6-m -mcpu=cortex-m0plus -mthumb -Og -g -ffunction-sections -fdata-sections
CORE_FLAGS += $(addprefix -D,$(DEFINES))

AS_FLAGS = $(CORE_FLAGS)
C_FLAGS = $(CORE_FLAGS) -std=gnu11 -MMD

FUNCS_WRAPPED = sprintf snprintf vsnprintf printf vprintf puts putchar \
__clzsi2 __clzdi2 __ctzsi2 __ctzdi2 __clz __clzl __clzll __popcountsi2 __popcountdi2 \
__aeabi_idiv __aeabi_idivmod __aeabi_ldivmod __aeabi_uidiv __aeabi_uidivmod __aeabi_uldivmod \
__aeabi_dadd __aeabi_ddiv __aeabi_dmul __aeabi_drsub __aeabi_dsub \
__aeabi_cdcmpeq __aeabi_cdrcmple __aeabi_cdcmple __aeabi_dcmpeq __aeabi_dcmpl \
 __aeabi_dcmple __aeabi_dcmpge __aeabi_dcmpgt __aeabi_dcmpun __aeabi_i2d \
__aeabi_l2d __aeabi_ui2d __aeabi_ul2d __aeabi_d2iz __aeabi_d2lz __aeabi_d2uiz __aeabi_d2ulz \
__aeabi_d2f __aeabi_lmul __aeabi_fadd __aeabi_fdiv __aeabi_fmul __aeabi_frsub __aeabi_fsub \
__aeabi_cfcmpeq __aeabi_cfrcmple __aeabi_cfcmple __aeabi_fcmpeq __aeabi_fcmplt \
__aeabi_fcmple __aeabi_fcmpge __aeabi_fcmpgt __aeabi_fcmpun \
__aeabi_i2f __aeabi_l2f __aeabi_ui2f __aeabi_ul2f __aeabi_f2iz __aeabi_f2lz __aeabi_f2uiz __aeabi_f2ulz __aeabi_f2d \
__aeabi_memcpy __aeabi_memset __aeabi_memcpy4 __aeabi_memset4 __aeabi_memcpy8 __aeabi_memset8 \
sqrt cos sin tan atan2 exp log ldexp copysign trunc floor ceil round sincos asin acos atan \
sinh cosh tanh asinh acosh atanh exp2 log2 exp10 log10 pow powint hypot cbrt fmod drem remainder remquo \
expm1 log1p fma sqrtf cosf sinf tanf atan2f expf logf ldexpf copysignf truncf floorf ceilf roundf \
sincosf asinf acosf atanf sinhf coshf tanhf asinhf acoshf atanhf exp2f log2f exp10f log10f \
powf powintf hypotf cbrtf fmodf dremf remainderf remquof expm1f log1pf \
fmaf malloc calloc free memcpy memset


WL_PREFIX = -Wl,--wrap=

LD_FLAGS =
LD_FLAGS += -march=armv6-m
LD_FLAGS += -mcpu=cortex-m0plus
LD_FLAGS += -mthumb
LD_FLAGS += -Og
LD_FLAGS += -g
LD_FLAGS += -Wl,--build-id=none
LD_FLAGS += --specs=nosys.specs
LD_FLAGS += -Wl,-Map=$(MAP)
LD_FLAGS += -Wl,--script=$(LD_SCRIPT)
LD_FLAGS += -Wl,--gc-sections
LD_FLAGS += -Wl,--print-memory-usage

LD_FLAGS += $(addprefix $(WL_PREFIX),$(FUNCS_WRAPPED))


#--------------------
#files

SDK_C_SRCS =
SDK_C_SRCS += $(PICO_SDK_DIR)/src/common/time.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/common/timeout_helper.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/common/sem.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/common/lock_core.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/common/mutex.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/common/critical_section.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/common/datetime.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/common/pheap.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/common/queue.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/stdlib.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/gpio.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/flash.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/claim.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/sync.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/platform.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/uart.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/timer.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/runtime.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/clocks.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/watchdog.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/xosc.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/pll.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/vreg.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/irq.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/pio.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/printf.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/bootrom.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/double_init_rom.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/double_math.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/float_init_rom.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/float_math.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/pico_malloc.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/stdio.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/stdio_uart.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/multicore.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/pico_bootsel_via_double_reset.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/i2c.c

#USB
SDK_C_SRCS += $(TINYUSB_DIR)/src/portable/raspberrypi/rp2040/dcd_rp2040.c
SDK_C_SRCS += $(TINYUSB_DIR)/src/portable/raspberrypi/rp2040/rp2040_usb.c
SDK_C_SRCS += $(TINYUSB_DIR)/src/device/usbd.c
SDK_C_SRCS += $(TINYUSB_DIR)/src/device/usbd_control.c
SDK_C_SRCS += $(TINYUSB_DIR)/src/class/hid/hid_device.c
SDK_C_SRCS += $(TINYUSB_DIR)/src/tusb.c
SDK_C_SRCS += $(TINYUSB_DIR)/src/common/tusb_fifo.c
SDK_C_SRCS += $(PICO_SDK_DIR)/src/rp2_common/rp2040_usb_device_enumeration/rp2040_usb_device_enumeration.c

SDK_ASM_SRCS =
SDK_ASM_SRCS += $(PICO_SDK_DIR)/src/rp2_common/divider__hardware_divider.S
SDK_ASM_SRCS += $(PICO_SDK_DIR)/src/rp2_common/divider__pico_divider.S
SDK_ASM_SRCS += $(PICO_SDK_DIR)/src/rp2_common/irq_handler_chain.S
SDK_ASM_SRCS += $(PICO_SDK_DIR)/src/rp2_common/bit_ops_aeabi.S
SDK_ASM_SRCS += $(PICO_SDK_DIR)/src/rp2_common/double_aeabi.S
SDK_ASM_SRCS += $(PICO_SDK_DIR)/src/rp2_common/double_v1_rom_shim.S
SDK_ASM_SRCS += $(PICO_SDK_DIR)/src/rp2_common/pico_int64_ops_aeabi.S
SDK_ASM_SRCS += $(PICO_SDK_DIR)/src/rp2_common/float_aeabi.S
SDK_ASM_SRCS += $(PICO_SDK_DIR)/src/rp2_common/float_v1_rom_shim.S
SDK_ASM_SRCS += $(PICO_SDK_DIR)/src/rp2_common/mem_ops_aeabi.S
SDK_ASM_SRCS += $(PICO_SDK_DIR)/src/rp2_common/crt0.S

BOOT_S = $(PICO_LOCAL_DIR)/loaders/bs2_default_padded_checksummed.S
LD_SCRIPT = $(PICO_LOCAL_DIR)/loaders/memmap_default.ld

-include $(PROJECT_CODE_DIR)/rules_post_declarations.mk

C_SRCS = $(addprefix $(MODULES_DIR)/,$(MODULE_SRCS))
C_SRCS += $(addprefix $(PROJECT_CODE_DIR)/, $(PROJECT_SRCS))
C_SRCS += $(addprefix $(PROJECT_STENCIL_DIR)/, $(PROJECT_STENCIL_SRCS))

C_OBJS = $(addprefix $(OBJ_DIR)/,$(C_SRCS:.c=.c.obj))
SDK_C_OBJS = $(addprefix $(SHARED_OBJ_DIR)/,$(SDK_C_SRCS:.c=.c.obj))
SDK_ASM_OBJS = $(addprefix $(SHARED_OBJ_DIR)/,$(SDK_ASM_SRCS:.S=.S.obj))

OBJS =  $(C_OBJS) $(SDK_C_OBJS) $(SDK_ASM_OBJS)

PIOASM_SRCS = $(addprefix $(MODULES_DIR)/, $(MODULE_PIOASM_SRCS))
PIOASM_SRCS += $(addprefix $(PROJECT_CODE_DIR)/, $(PROJECT_PIOASM_SRCS))

PIOASM_GENERATED_HEADERS = $(PIOASM_SRCS:.pio=.pio.h)

DEP_FILES = $(filter %.d,$(OBJS:%.obj=%.d))
-include $(DEP_FILES)

#--------------------
#targets

build: $(UF2)

%.pio.h: %.pio $(PIOASM_BIN)
	$(PIOASM_BIN) -o c-sdk $< $@

$(OBJ_DIR)/%.c.obj: %.c
	@echo compiling $<
	@"mkdir" -p $(dir $@)
	@$(CC) $(C_FLAGS) -o $@ -c $<

$(SHARED_OBJ_DIR)/%.c.obj: %.c
	@echo compiling $<
	@"mkdir" -p $(dir $@)
	@$(CC) $(C_FLAGS) -o $@ -c $<

$(SHARED_OBJ_DIR)/%.S.obj: %.S
	@echo compiling $<
	@"mkdir" -p $(dir $@)
	@$(AS) $(AS_FLAGS) -o $@ -c $<

$(ELF): $(PIOASM_GENERATED_HEADERS) $(OBJS)
	@echo linking
	@"mkdir" -p $(dir $@)
	@$(LD) $(LD_FLAGS) $(OBJS) -o $(ELF) $(BOOT_S)
	@$(OBJCOPY) -Oihex $(ELF) $(HEX)
	@$(OBJCOPY) -Obinary $(ELF) $(BIN)
	@$(OBJDUMP) -h $(ELF) >$(DIS)
	@$(OBJDUMP) -d $(ELF) >>$(DIS)

$(ELF2UF2_BIN):
	cd $(ELF2UF2_ROOT_DIR) && make

$(PIOASM_BIN):
	cd $(PIOASM_ROOT_DIR) && make

$(UF2): $(ELF) $(ELF2UF2_BIN)
	$(ELF2UF2_BIN) $(ELF) $(UF2)
	@echo output: $(UF2)

size: $(OBJS)
	@$(LD) $(LD_FLAGS) $(OBJS) -o $(ELF) $(BOOT_S)

flash: $(UF2)
	cp $(UF2) $(RP2040_UF2_TARGET_DRIVE_PATH)/$(CORE_NAME).uf2

flash_patched_uf2: $(PATCHED_UF2)
	cp $(PATCHED_UF2) $(RP2040_UF2_TARGET_DRIVE_PATH)/$(CORE_NAME).uf2


flash_via_swd: $(ELF)
	openocd -f interface/picoprobe.cfg -f target/rp2040.cfg -c "program $(ELF) verify reset exit"

clean_app:
	rm -rf $(OUT_DIR)

clean:
	rm -rf $(OUT_DIR) $(SHARED_OBJ_DIR)

.PHONY: build