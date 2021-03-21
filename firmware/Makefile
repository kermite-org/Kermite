ARGS = $(word $2,$(subst :, ,$1))
ARG_PROJECT = $(call ARGS,$*,1)
ARG_MCU_TARGET = $(call ARGS,$*,2)
ARG_COMMAND = $(call ARGS,$*,3)

all:
	@echo "usage: make <project_path>:<mcu_target>:<command>"

%:
	make -f worker/$(ARG_MCU_TARGET).mk PROJECT=$(ARG_PROJECT) $(ARG_COMMAND)

clean:
	rm -rf build dist
