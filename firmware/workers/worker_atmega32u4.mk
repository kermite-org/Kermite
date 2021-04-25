-include Makefile.user

REL_PROJECT_CODE_DIR = $(PROJECT)/$(VARIATION)
PROJECT_CODE_DIR = src/projects/$(REL_PROJECT_CODE_DIR)

BUILD_DIR = build
OUT_DIR = build/$(REL_PROJECT_CODE_DIR)
OBJ_DIR = $(OUT_DIR)/obj
CORE_NAME = $(notdir $(PROJECT))_$(VARIATION)

MODULE_SRCS =
PROJECT_SRCS =
RULES_MK = $(PROJECT_CODE_DIR)/rules.mk
-include $(RULES_MK)

RELEASE_REVISION ?= 0
IS_RESOURCE_ORIGIN_ONLINE ?= 0

#--------------------

ELF = $(OUT_DIR)/$(CORE_NAME).elf
HEX = $(OUT_DIR)/$(CORE_NAME).hex
LST = $(OUT_DIR)/$(CORE_NAME).lst
MAP = $(OUT_DIR)/$(CORE_NAME).map

INC_PATHS =
INC_PATHS += -Isrc/modules
INC_PATHS += -I$(PROJECT_CODE_DIR)

MODULE_ASM_SRCS =
PROJECT_ASM_SRCS =

CFLAGS =
ASFLAGS =
LDFLAGS =

C_SRCS = $(addprefix src/modules/,$(MODULE_SRCS)) $(addprefix $(PROJECT_CODE_DIR)/, $(PROJECT_SRCS))
ASM_SRCS = $(addprefix src/modules/,$(MODULE_ASM_SRCS)) $(addprefix $(PROJECT_CODE_DIR)/, $(PROJECT_ASM_SRCS))

C_OBJS = $(addprefix $(OBJ_DIR)/,$(C_SRCS:.c=.o))
ASM_OBJS = $(addprefix $(OBJ_DIR)/,$(ASM_SRCS:.S=.o))

OBJS = $(C_OBJS) $(ASM_OBJS)

DEP_FILES = $(filter %.d,$(OBJS:%.o=%.d))
-include $(DEP_FILES)

CC = avr-gcc
OBJCOPY = avr-objcopy
OBJSIZE = avr-size
OBJDUMP = avr-objdump

CFLAGS += -mmcu=atmega32u4
CFLAGS += -Os
CFLAGS += -g
CFLAGS += -Wall
CFLAGS += $(INC_PATHS)
CFLAGS += -D__AVR_ATmega32U4__
CFLAGS += -MMD
CFLAGS += -DF_CPU=16000000UL
CFLAGS += -DEXTR_KERMITE_PROJECT_RELEASE_BUILD_REVISION=$(RELEASE_REVISION)
CFLAGS += -DEXTR_KERMITE_IS_RESOURCE_ORIGIN_ONLINE=$(IS_RESOURCE_ORIGIN_ONLINE)
CFLAGS += -DEXTR_KERMITE_VARIATION_NAME=\"$(VARIATION)\"
CFLAGS += -DKERMITE_TARGET_MCU_ATMEGA

ASFLAGS += -gstabs 
ASFLAGS += -mmcu=atmega32u4
ASFLAGS += -Isrc
ASFLAGS += -x assembler-with-cpp

LDFLAGS += -mmcu=atmega32u4
LDFLAGS += -Os
LDFLAGS += -g
LDFLAGS += -Wall
LDFLAGS += -Wl,-Map=$(MAP),--cref


all: build

build: $(HEX) $(LST)

$(OBJ_DIR)/%.o: %.c
	@echo "compiling $<"
	@mkdir -p $(dir $@)
	@$(CC) -c $(CFLAGS) -o $@ $<

$(OBJ_DIR)/%.o: %.S
	@echo "compiling $<"
	@mkdir -p $(dir $@)
	$(CC) -c $(ASFLAGS) $< -o $@

$(ELF): $(OBJS)
	@echo "linking"
	@mkdir -p $(dir $@)
	@$(CC) $(LDFLAGS) -o $(ELF) $(OBJS)
	@$(OBJSIZE) -C --mcu=atmega32u4 $(ELF)

$(HEX) : $(ELF)
	@$(OBJCOPY) -O ihex $(ELF) $(HEX)
	@echo "output: $(HEX)"

$(LST): $(ELF)
	@$(OBJDUMP) -h -S $< > $@

size: $(ELF)
	$(OBJSIZE) -C --mcu=atmega32u4 $(ELF)


flash: build
ifndef AVRDUDE_COM_PORT
	$(error variable AVRDUDE_COM_PORT is not set)
endif
ifdef AVRDUDE_COM_PORT_ALT
	-avrdude -p m32u4 -P $(AVRDUDE_COM_PORT_ALT) -c avr109 -U flash:w:$(HEX)
endif
	avrdude -p m32u4 -P $(AVRDUDE_COM_PORT) -c avr109 -U flash:w:$(HEX)

purge:
	rm -rf $(ELF) $(HEX) $(LIST) $(OBJS)

clean_app:
	rm -rf $(OUT_DIR)

clean:
	rm -rf $(OUT_DIR)

.PHONY: build
	





