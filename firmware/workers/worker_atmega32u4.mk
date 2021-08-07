-include Makefile.user

REL_PROJECT_CODE_DIR = $(PROJECT)/$(VARIATION)
PROJECT_CODE_DIR = src/projects/$(REL_PROJECT_CODE_DIR)

BUILD_DIR = build
OUT_DIR = build/$(REL_PROJECT_CODE_DIR)
OBJ_DIR = $(OUT_DIR)/obj
CORE_NAME = $(notdir $(PROJECT))_$(VARIATION)

DEFINES =
MODULE_SRCS =
PROJECT_SRCS =
MODULE_ASM_SRCS =
PROJECT_ASM_SRCS =
PROJECT_STENCIL_SRCS =

RULES_MK = $(PROJECT_CODE_DIR)/rules.mk

-include $(RULES_MK)

PROJECT_STENCIL_DIR :=
ifneq ($(TARGET_STENCIL),)
	PROJECT_STENCIL_DIR := src/projects/__stencils/$(TARGET_STENCIL)
	include $(PROJECT_STENCIL_DIR)/rules_atmega32u4.mk
endif

RELEASE_REVISION ?= 0
IS_RESOURCE_ORIGIN_ONLINE ?= 0

#--------------------

ELF = $(OUT_DIR)/$(CORE_NAME).elf
BIN = $(OUT_DIR)/$(CORE_NAME).bin
HEX = $(OUT_DIR)/$(CORE_NAME).hex
LST = $(OUT_DIR)/$(CORE_NAME).lst
MAP = $(OUT_DIR)/$(CORE_NAME).map

INC_PATHS =
INC_PATHS += -Isrc/modules
INC_PATHS += -I$(PROJECT_CODE_DIR)
INC_PATHS += -I$(PROJECT_STENCIL_DIR)

CFLAGS =
ASFLAGS =
LDFLAGS =

C_SRCS = $(addprefix src/modules/,$(MODULE_SRCS))
C_SRCS += $(addprefix $(PROJECT_CODE_DIR)/, $(PROJECT_SRCS))
C_SRCS += $(addprefix $(PROJECT_STENCIL_DIR)/, $(PROJECT_STENCIL_SRCS))

ASM_SRCS = $(addprefix src/modules/,$(MODULE_ASM_SRCS))
ASM_SRFCS += $(addprefix $(PROJECT_CODE_DIR)/, $(PROJECT_ASM_SRCS))

C_OBJS = $(addprefix $(OBJ_DIR)/,$(C_SRCS:.c=.o))
ASM_OBJS = $(addprefix $(OBJ_DIR)/,$(ASM_SRCS:.S=.o))

OBJS = $(C_OBJS) $(ASM_OBJS)

DEP_FILES = $(filter %.d,$(OBJS:%.o=%.d))
-include $(DEP_FILES)

CC = avr-gcc
OBJCOPY = avr-objcopy
OBJSIZE = avr-size
OBJDUMP = avr-objdump

DEFINES += EXTR_KERMITE_PROJECT_RELEASE_BUILD_REVISION=$(RELEASE_REVISION)
DEFINES += EXTR_KERMITE_IS_RESOURCE_ORIGIN_ONLINE=$(IS_RESOURCE_ORIGIN_ONLINE)
DEFINES += EXTR_KERMITE_VARIATION_NAME=\"$(VARIATION)\"
DEFINES += KERMITE_TARGET_MCU_ATMEGA

CFLAGS += -mmcu=atmega32u4
CFLAGS += -Os
CFLAGS += -g
CFLAGS += -Wall
CFLAGS += $(INC_PATHS)
CFLAGS += -D__AVR_ATmega32U4__
CFLAGS += -MMD
CFLAGS += -DF_CPU=16000000UL
CFLAGS += $(addprefix -D,$(DEFINES))

ASFLAGS += -gstabs 
ASFLAGS += -mmcu=atmega32u4
ASFLAGS += $(INC_PATHS)
ASFLAGS += $(addprefix -D,$(DEFINES))

LDFLAGS += -mmcu=atmega32u4
LDFLAGS += -Os
LDFLAGS += -g
LDFLAGS += -Wall
LDFLAGS += -Wl,-Map=$(MAP),--cref
LDFLAGS += -Wl,--print-memory-usage
LDFLAGS += -Wl,--cref,--defsym=__TEXT_REGION_LENGTH__=32768
LDFLAGS += -Wl,--cref,--defsym=__DATA_REGION_LENGTH__=2560
LDFLAGS += -Wl,--cref,--defsym=__EEPROM_REGION_LENGTH__=1024


all: build

build: $(BIN) $(HEX) $(LST)

$(OBJS): $(RULES_MK)

$(OBJ_DIR)/%.o: %.c 
	@echo compiling $<
	@"mkdir" -p $(dir $@)
	@$(CC) -c $(CFLAGS) -o $@ $<

$(OBJ_DIR)/%.o: %.S
	@echo compiling $<
	@"mkdir" -p $(dir $@)
	@$(CC) -c $(ASFLAGS) $< -o $@

$(ELF): $(OBJS)
	@echo linking
	@"mkdir" -p $(dir $@)
	@$(CC) $(LDFLAGS) -o $(ELF) $(OBJS)

$(HEX) : $(ELF)
	@$(OBJCOPY) -O ihex $(ELF) $(HEX)
	@echo output: $(HEX)

$(BIN) : $(ELF)
	@$(OBJCOPY) -O binary $(ELF) $(BIN)

$(LST): $(ELF)
	@$(OBJDUMP) -h -S $< > $@

size: $(ELF)
	$(OBJSIZE) $(ELF)
#	$(OBJSIZE) -C --mcu=atmega32u4 $(ELF)

flash: build
ifndef AVRDUDE_COM_PORT
	$(error variable AVRDUDE_COM_PORT is not set)
endif
ifdef AVRDUDE_COM_PORT_ALT
	-avrdude -p m32u4 -P $(AVRDUDE_COM_PORT_ALT) -c avr109 -U flash:w:$(HEX)
endif
	avrdude -p m32u4 -P $(AVRDUDE_COM_PORT) -c avr109 -U flash:w:$(HEX)

flash_with_dfu: build
	dfu-programmer atmega32u4 erase
	dfu-programmer atmega32u4 flash $(HEX)
	dfu-programmer atmega32u4 reset

purge:
	rm -rf $(ELF) $(HEX) $(LIST) $(OBJS)

clean_app:
	rm -rf $(OUT_DIR)

clean:
	rm -rf $(OUT_DIR)

show_ram_usage:
	$(OBJSIZE) -C --mcu=atmega32u4 $(ELF)
	avr-nm -r --size-sort -td $(ELF) | grep -i ' [dbv] '

.PHONY: build
	





