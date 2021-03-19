
PROJECT ?=
-include Makefile.user

PROJECT_CODE_DIR = src/projects/$(PROJECT)
PROJECT_CODE_DIR_ALT = src/projects/$(PROJECT)/source/rp2040
ifneq "$(wildcard $(PROJECT_CODE_DIR_ALT) )" ""
PROJECT_CODE_DIR = $(PROJECT_CODE_DIR_ALT)
endif

#import rules.mk
MODULE_SRCS = 
PROJECT_SRCS =
RULES_MK = $(PROJECT_CODE_DIR)/rules.mk
-include $(RULES_MK)

MODULES_DIR = src/modules

BUILD_DIR = build
OBJ_DIR = build/$(PROJECT)/rp2040/obj

RELEASE_REVISION ?= 0
IS_RESOURCE_ORIGIN_ONLINE ?= 0

#--------------------

PICO_SDK_DIR = deps/rp2040/external/pico_sdk
PICO_LOCAL_DIR = deps/rp2040/local

OUT_DIR = $(BUILD_DIR)/$(PROJECT)
CORE_NAME = $(notdir $(PROJECT))
ELF = $(OUT_DIR)/$(CORE_NAME).elf
BIN = $(OUT_DIR)/$(CORE_NAME).bin
HEX = $(OUT_DIR)/$(CORE_NAME).hex
DIS = $(OUT_DIR)/$(CORE_NAME).dis
LST = $(OUT_DIR)/$(CORE_NAME).lst
MAP = $(OUT_DIR)/$(CORE_NAME).map
UF2 = $(OUT_DIR)/$(CORE_NAME).uf2

CC = arm-none-eabi-gcc
AS = arm-none-eabi-gcc
LD = arm-none-eabi-g++
OBJCOPY = arm-none-eabi-objcopy
OBJDUMP = arm-none-eabi-objdump
ELF2UF2 = $(PICO_LOCAL_DIR)/tools/elf2uf2

#--------------------
#flags

DEFINES = \
-DCFG_TUSB_DEBUG=1 \
-DCFG_TUSB_MCU=OPT_MCU_RP2040 \
-DCFG_TUSB_OS=OPT_OS_PICO \
-DPICO_BIT_OPS_PICO=1 \
-DPICO_BOARD=\"pico\" \
-DPICO_BOOT2_NAME=\"boot2_w25q080\" \
-DPICO_BUILD=1 \
-DPICO_CMAKE_BUILD_TYPE=\"Debug\" \
-DPICO_COPY_TO_RAM=0 \
-DPICO_CXX_ENABLE_EXCEPTIONS=0 \
-DPICO_DIVIDER_HARDWARE=1 \
-DPICO_DOUBLE_PICO=1 \
-DPICO_FLOAT_PICO=1 \
-DPICO_INT64_OPS_PICO=1 \
-DPICO_MEM_OPS_PICO=1 \
-DPICO_NO_FLASH=0 \
-DPICO_NO_HARDWARE=0 \
-DPICO_ON_DEVICE=1 \
-DPICO_PRINTF_PICO=1 \
-DPICO_STDIO_UART=1 \
-DPICO_USE_BLOCKED_RAM=0 \
-DRP2040_USB_DEVICE_MODE=1 \
-DTINYUSB_DEVICE_LINKED=1 \
-DPICO_TARGET_NAME=\"kermite\" \
-DPICO_PROGRAM_URL=\"https://github.com/yahiro07/Kermite/tree/master/firmware\" \
-DPICO_BOOTSEL_VIA_DOUBLE_RESET_TIMEOUT_MS=500 \
-DTARGET_MCU_RP2040 \
-DEXTR_PROJECT_RELEASE_BUILD_REVISION=$(RELEASE_REVISION) \
-DEXTR_IS_RESOURCE_ORIGIN_ONLINE=$(IS_RESOURCE_ORIGIN_ONLINE) \

CORE_FLAGS = $(DEFINES) $(INC_PATHS) -march=armv6-m -mcpu=cortex-m0plus -mthumb -Og -g -ffunction-sections -fdata-sections
AS_FLAGS = $(CORE_FLAGS)
C_FLAGS = $(CORE_FLAGS) -std=gnu11

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

LD_FLAGS = \
-march=armv6-m \
-mcpu=cortex-m0plus \
-mthumb \
-Og \
-g \
-Wl,--build-id=none \
--specs=nosys.specs \
-Wl,-Map=$(MAP) \
-Wl,--script=$(LD_SCRIPT) \
-Wl,--gc-sections \
-Wl,--print-memory-usage

LD_FLAGS += $(addprefix $(WL_PREFIX),$(FUNCS_WRAPPED))


#--------------------
#files

INC_PATHS = \
-I$(PROJECT_CODE_DIR) \
-I$(PICO_LOCAL_DIR)/include \
-I$(MODULES_DIR)/km0/common \
-I$(MODULES_DIR)/km0/device_io \
-I$(MODULES_DIR)/km0/keyboard \
-I$(PICO_SDK_DIR)/src/rp2040/hardware_regs/include \
-I$(PICO_SDK_DIR)/src/rp2040/hardware_structs/include \
-I$(PICO_SDK_DIR)/src/common/pico_stdlib/include \
-I$(PICO_SDK_DIR)/src/common/pico_base/include \
-I$(PICO_SDK_DIR)/src/common/pico_time/include \
-I$(PICO_SDK_DIR)/src/common/pico_sync/include \
-I$(PICO_SDK_DIR)/src/common/pico_util/include \
-I$(PICO_SDK_DIR)/src/common/pico_bit_ops/include \
-I$(PICO_SDK_DIR)/src/common/pico_divider/include \
-I$(PICO_SDK_DIR)/src/common/pico_binary_info/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_gpio/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_flash/include \
-I$(PICO_SDK_DIR)/src/rp2_common/pico_platform/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_base/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_claim/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_sync/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_uart/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_divider/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_timer/include \
-I$(PICO_SDK_DIR)/src/rp2_common/pico_runtime/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_clocks/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_resets/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_watchdog/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_xosc/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_pll/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_vreg/include \
-I$(PICO_SDK_DIR)/src/rp2_common/hardware_irq/include \
-I$(PICO_SDK_DIR)/src/rp2_common/pico_printf/include \
-I$(PICO_SDK_DIR)/src/rp2_common/pico_bootrom/include \
-I$(PICO_SDK_DIR)/src/rp2_common/pico_double/include \
-I$(PICO_SDK_DIR)/src/rp2_common/pico_int64_ops/include \
-I$(PICO_SDK_DIR)/src/rp2_common/pico_float/include \
-I$(PICO_SDK_DIR)/src/rp2_common/pico_malloc/include \
-I$(PICO_SDK_DIR)/src/rp2_common/pico_stdio/include \
-I$(PICO_SDK_DIR)/src/rp2_common/pico_stdio_uart/include \
-I$(PICO_SDK_DIR)/lib/tinyusb/src \
-I$(PICO_SDK_DIR)/lib/tinyusb/src/common \
-I$(PICO_SDK_DIR)/src/rp2_common/pico_fix/rp2040_usb_device_enumeration/include


SDK_SRCS = \
$(PICO_SDK_DIR)/src/common/pico_time/time.c \
$(PICO_SDK_DIR)/src/common/pico_time/timeout_helper.c \
$(PICO_SDK_DIR)/src/common/pico_sync/sem.c \
$(PICO_SDK_DIR)/src/common/pico_sync/lock_core.c \
$(PICO_SDK_DIR)/src/common/pico_sync/mutex.c \
$(PICO_SDK_DIR)/src/common/pico_sync/critical_section.c \
$(PICO_SDK_DIR)/src/common/pico_util/datetime.c \
$(PICO_SDK_DIR)/src/common/pico_util/pheap.c \
$(PICO_SDK_DIR)/src/common/pico_util/queue.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_stdlib/stdlib.c \
$(PICO_SDK_DIR)/src/rp2_common/hardware_gpio/gpio.c \
$(PICO_SDK_DIR)/src/rp2_common/hardware_flash/flash.c \
$(PICO_SDK_DIR)/src/rp2_common/hardware_claim/claim.c \
$(PICO_SDK_DIR)/src/rp2_common/hardware_sync/sync.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_platform/platform.c \
$(PICO_SDK_DIR)/src/rp2_common/hardware_uart/uart.c \
$(PICO_SDK_DIR)/src/rp2_common/hardware_timer/timer.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_runtime/runtime.c \
$(PICO_SDK_DIR)/src/rp2_common/hardware_clocks/clocks.c \
$(PICO_SDK_DIR)/src/rp2_common/hardware_watchdog/watchdog.c \
$(PICO_SDK_DIR)/src/rp2_common/hardware_xosc/xosc.c \
$(PICO_SDK_DIR)/src/rp2_common/hardware_pll/pll.c \
$(PICO_SDK_DIR)/src/rp2_common/hardware_vreg/vreg.c \
$(PICO_SDK_DIR)/src/rp2_common/hardware_irq/irq.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_printf/printf.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_bootrom/bootrom.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_double/double_init_rom.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_double/double_math.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_float/float_init_rom.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_float/float_math.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_malloc/pico_malloc.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_standard_link/binary_info.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_stdio/stdio.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_stdio_uart/stdio_uart.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_bootsel_via_double_reset/pico_bootsel_via_double_reset.c

#USB
SDK_SRCS += $(PICO_SDK_DIR)/lib/tinyusb/src/portable/raspberrypi/rp2040/dcd_rp2040.c \
$(PICO_SDK_DIR)/lib/tinyusb/src/portable/raspberrypi/rp2040/rp2040_usb.c \
$(PICO_SDK_DIR)/lib/tinyusb/src/device/usbd.c \
$(PICO_SDK_DIR)/lib/tinyusb/src/device/usbd_control.c \
$(PICO_SDK_DIR)/lib/tinyusb/src/class/hid/hid_device.c \
$(PICO_SDK_DIR)/lib/tinyusb/src/tusb.c \
$(PICO_SDK_DIR)/lib/tinyusb/src/common/tusb_fifo.c \
$(PICO_SDK_DIR)/src/rp2_common/pico_fix/rp2040_usb_device_enumeration/rp2040_usb_device_enumeration.c \


ASM_SRCS = \
$(PICO_SDK_DIR)/src/rp2_common/hardware_divider/divider.S \
$(PICO_SDK_DIR)/src/rp2_common/hardware_irq/irq_handler_chain.S \
$(PICO_SDK_DIR)/src/rp2_common/pico_bit_ops/bit_ops_aeabi.S \
$(PICO_SDK_DIR)/src/rp2_common/pico_divider/divider.S \
$(PICO_SDK_DIR)/src/rp2_common/pico_double/double_aeabi.S \
$(PICO_SDK_DIR)/src/rp2_common/pico_double/double_v1_rom_shim.S \
$(PICO_SDK_DIR)/src/rp2_common/pico_int64_ops/pico_int64_ops_aeabi.S \
$(PICO_SDK_DIR)/src/rp2_common/pico_float/float_aeabi.S \
$(PICO_SDK_DIR)/src/rp2_common/pico_float/float_v1_rom_shim.S \
$(PICO_SDK_DIR)/src/rp2_common/pico_mem_ops/mem_ops_aeabi.S \
$(PICO_SDK_DIR)/src/rp2_common/pico_standard_link/crt0.S \

BOOT_S = $(PICO_LOCAL_DIR)/loaders/bs2_default_padded_checksummed.S
LD_SCRIPT = $(PICO_LOCAL_DIR)/loaders/memmap_default.ld

C_SRCS = $(SDK_SRCS) \
$(addprefix src/modules/,$(MODULE_SRCS)) \
$(addprefix $(PROJECT_CODE_DIR)/, $(PROJECT_SRCS)) 

C_OBJS = $(addprefix $(OBJ_DIR)/,$(C_SRCS:.c=.c.obj))
ASM_OBJS = $(addprefix $(OBJ_DIR)/,$(ASM_SRCS:.S=.S.obj))
OBJS = $(C_OBJS) $(CPP_OBJS) $(ASM_OBJS)

DEP_FILES = $(filter %.d,$(OBJS:%.obj=%.d))
-include $(DEP_FILES)

#--------------------
#targets

build: $(UF2)

$(OBJ_DIR)/%.c.obj: %.c
	@echo "compiling $<"
	@mkdir -p $(dir $@)
	@$(CC) $(C_FLAGS) -o $@ -c $<

$(OBJ_DIR)/%.S.obj: %.S
	@echo "compiling $<"
	@mkdir -p $(dir $@)
	@$(AS) $(AS_FLAGS) -o $@ -c $<

$(ELF): $(OBJS)
	@echo "linking"
	@mkdir -p $(dir $@)
	@$(LD) $(LD_FLAGS) $(OBJS) -o $(ELF) $(BOOT_S)
	@$(OBJCOPY) -Oihex $(ELF) $(HEX)
	@$(OBJCOPY) -Obinary $(ELF) $(BIN)
	@$(OBJDUMP) -h $(ELF) >$(DIS)
	@$(OBJDUMP) -d $(ELF) >>$(DIS)

$(UF2): $(ELF)
	$(ELF2UF2) $(ELF) $(UF2)

flash0: $(UF2)
	cp $(UF2) /Volumes/RPI-RP2

flash: $(ELF)
	openocd -f interface/picoprobe.cfg -f target/rp2040.cfg -c "program $(ELF) verify reset exit"

clean:
	rm -rf build

.PHONY: build