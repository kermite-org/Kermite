ARGS = $(subst :, , $(MAKECMDGOALS))
NUM_ARGS = $(words $(ARGS))

ifeq ($(NUM_ARGS),3)

PROJECT = $(word 1, $(ARGS))
VARIATION = $(word 2, $(ARGS))
COMMAND = $(word 3, $(ARGS))

else ifeq ($(NUM_ARGS), 2)

PROJECT = $(word 1, $(ARGS))
VARIATION =
COMMAND = $(word 2, $(ARGS))

else

#read PROJECT and VARIATION from Makefile.user
PROJECT =
VARIATION =
-include Makefile.user
COMMAND = $(word 1, $(ARGS))

ifeq ($(PROJECT),)
build:
	$(error usage: make <project_path>:<variation>:<command>)
endif

endif

# $(warning project:$(PROJECT) variation:$(VARIATION) command:$(COMMAND))

ifneq ($(PROJECT),)
ifneq ($(COMMAND),)

#read TARGET_MCU from rules.mk
TARGET_MCU =
RULES_MK = src/projects/$(PROJECT)/rules.mk
ifneq ($(VARIATION),)
RULES_MK = src/projects/$(PROJECT)/$(VARIATION)/rules.mk
endif
ifeq ($(wildcard $(RULES_MK)),)
$(error file not found: $(RULES_MK))
endif
-include $(RULES_MK)

ifeq ($(TARGET_MCU), )
$(error TARGET_MCU is not defined in rules.mk)
endif

# $(warning target_mcu:$(TARGET_MCU))

%:
	make -f worker/$(TARGET_MCU).mk PROJECT=$(PROJECT) VARIATION=$(VARIATION) $(COMMAND)

build:
	make -f worker/$(TARGET_MCU).mk PROJECT=$(PROJECT) VARIATION=$(VARIATION) build

endif
endif

default:
	@echo "usage: make <project_path>:<variation>:<command>"

clean:
	rm -rf build dist

.PHONY: build