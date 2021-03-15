ARGS = $(word $2,$(subst :, ,$1))
ARG_PROJECT = $(call ARGS,$*,1)
ARG_MCU_TARGET = $(call ARGS,$*,2)
ARG_COMMAND = $(call ARGS,$*,3)

%:
	make -f sub_makefiles/$(ARG_MCU_TARGET).mk PROJECT=$(ARG_PROJECT) $(ARG_COMMAND)

clean:
	rm -rf build dist
