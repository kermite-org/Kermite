ARGS = $(subst :, , $(MAKECMDGOALS))
NUM_ARGS = $(words $(ARGS))

ifeq ($(NUM_ARGS),3)

PROJECT = $(word 1, $(ARGS))
VARIATION = $(word 2, $(ARGS))
COMMAND = $(word 3, $(ARGS))

else ifeq ($(NUM_ARGS), 1)

#read PROJECT and VARIATION from Makefile.user
PROJECT =
VARIATION =
-include Makefile.user
COMMAND = $(word 1, $(ARGS))

default:
	@echo "usage: make <project_path>:<variation>:<command>"

ifeq ($(PROJECT),)
build: default
endif

ifeq ($(VARIATION),)
build: default
endif


clean:
	rm -rf build dist

.PHONY: build

else

$(error usage: make <project_path>:<variation>:<command>)

endif

# $(warning project:$(PROJECT) variation:$(VARIATION) command:$(COMMAND))

ifneq ($(PROJECT),)
ifneq ($(VARIATION),)
ifneq ($(COMMAND),)

#read TARGET_MCU from rules.mk
TARGET_MCU =
RULES_MK = src/projects/$(PROJECT)/$(VARIATION)/rules.mk
ifeq ($(wildcard $(RULES_MK)),)
$(error file not found: $(RULES_MK))
endif
-include $(RULES_MK)

ifeq ($(TARGET_MCU), )
$(error TARGET_MCU is not defined in rules.mk)
endif

# $(warning TARGET_MCU:$(TARGET_MCU))

%:
	make -f workers/worker_$(TARGET_MCU).mk --no-print-directory PROJECT=$(PROJECT) VARIATION=$(VARIATION) $(COMMAND)

build:
	make -f workers/worker_$(TARGET_MCU).mk --no-print-directory PROJECT=$(PROJECT) VARIATION=$(VARIATION) build

endif
endif
endif