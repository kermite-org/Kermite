CXX = g++
CXX_FLAGS = -Isrc -Isrc/gen -std=gnu++11
LD_FLAGS = -Wl,-search_paths_first -Wl,-headerpad_max_install_names

CPP_SRCS = src/main.cpp \
src/pio_assembler.cpp \
src/pio_disassembler.cpp \
src/gen/lexer.cpp \
src/gen/parser.cpp \
src/c_sdk_output.cpp \
src/python_output.cpp \
src/hex_output.cpp \
src/ada_output.cpp

BUILD_DIR = build
OBJ_DIR = build/obj

EXE = $(BUILD_DIR)/pioasm

OBJS = $(addprefix $(OBJ_DIR)/, $(CPP_SRCS:.cpp=.cpp.obj)) 

build: $(EXE)

$(EXE): $(OBJS)
	@echo "linking"
	@mkdir -p $(dir $@)
	@$(CXX) $(LD_FLAGS) $^ -o $@
	@echo "output: $(EXE)"

$(OBJ_DIR)/%.cpp.obj: %.cpp
	@echo "compiling $<"
	@mkdir -p $(dir $@)
	@$(CXX) $(CXX_FLAGS) -o $@ -c $<

clean:
	rm -rf build

.PHONY: build
