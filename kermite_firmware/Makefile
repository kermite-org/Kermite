PROJECT ?= modules_dev
#PROJECT = astelia
-include Makefile.user

BUILD_DIR = build
OBJ_DIR = build/obj

APP = $(PROJECT)
CORE_NAME = $(notdir $(PROJECT))
ELF = $(BUILD_DIR)/$(APP)/$(CORE_NAME).elf
HEX = $(BUILD_DIR)/$(APP)/$(CORE_NAME).hex
LST = $(BUILD_DIR)/$(APP)/$(CORE_NAME).lst


INC_PATHS =
INC_PATHS += -Isrc/modules
INC_PATHS += -Isrc/projects/$(PROJECT)


MODULE_SRCS = 
PROJECT_SRCS = 

MODULE_ASM_SRCS =
PROJECT_ASM_SRCS =

CFLAGS =
ASFLAGS =
LDFLAGS =

RULES_MK = src/projects/$(PROJECT)/rules.mk
include $(RULES_MK)

C_SRCS = $(addprefix src/modules/,$(MODULE_SRCS)) $(addprefix src/projects/$(PROJECT)/, $(PROJECT_SRCS))
ASM_SRCS = $(addprefix src/modules/,$(MODULE_ASM_SRCS)) $(addprefix src/projects/$(PROJECT)/, $(PROJECT_ASM_SRCS))

C_OBJS = $(addprefix $(OBJ_DIR)/,$(C_SRCS:.c=.o))
ASM_OBJS = $(addprefix $(OBJ_DIR)/,$(ASM_SRCS:.S=.o))

OBJS = $(C_OBJS) $(ASM_OBJS)

#C_ASM_OUTPUTS = $(addprefix $(OBJ_DIR)/,$(C_SRCS:.c=.asm))

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
#CFLAGS += -std=c99
# CFLAGS += -funsigned-char
# CFLAGS += -funsigned-bitfields
# CFLAGS += -ffunction-sections
# CFLAGS += -fno-inline-small-functions
# CFLAGS += -fpack-struct
# CFLAGS += -fshort-enums
# CFLAGS += -fno-strict-aliasing
# CFLAGS += -Wstrict-prototypes

#CFLAGS += -mrelax

#ASFLAGS += -Wa,-adhlns=$(<:.S=.lst)
ASFLAGS += -gstabs 
ASFLAGS += -mmcu=atmega32u4
ASFLAGS += -Isrc
ASFLAGS += -x assembler-with-cpp

LDFLAGS += -mmcu=atmega32u4
LDFLAGS += -Os
LDFLAGS += -g
LDFLAGS += -Wall

#LDFLAGS += -mrelax


all: build

build: $(HEX) $(LST)
#build: $(HEX) $(LST) $(C_ASM_OUTPUTS)


#$(ASM_OUTPUTS)

force: clean all

# $(OBJ_DIR):
# 	mkdir $(BUILD_DIR)
# 	mkdir -p $(OBJ_DIR)

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

$(LST): $(ELF)
	@$(OBJDUMP) -h -S $< > $@

size: $(ELF)
	$(OBJSIZE) -C --mcu=atmega32u4 $(ELF)

$(OBJ_DIR)/%.asm: %.c
	$(CC) -S $(CFLAGS) -o $@ $<


DEP_FILES = $(filter %.d,$(OBJS:%.o=%.d))
-include $(DEP_FILES)




flash: build
ifndef COM_PORT
	$(error variable COM_PORT is not set)
endif
ifdef COM_PORT_ALT
	-avrdude -p m32u4 -P $(COM_PORT_ALT) -c avr109 -U flash:w:$(HEX)
endif
	avrdude -p m32u4 -P $(COM_PORT) -c avr109 -U flash:w:$(HEX)

run: flash

purge:
	rm -rf $(ELF) $(HEX) $(LIST) $(OBJS)

clean:
	rm -rf $(BUILD_DIR) dist

%\:build:
	@make --no-print-directory PROJECT=$* build

%\:flash:
	@make --no-print-directory PROJECT=$* flash

%\:run:
	@make --no-print-directory PROJECT=$* run

%\:size:
	@make --no-print-directory PROJECT=$* size

%\:purge:
	@make --no-print-directory PROJECT=$* purge

%\:clean:
	@make --no-print-directory PROJECT=$* clean


.PHONY: all
	





