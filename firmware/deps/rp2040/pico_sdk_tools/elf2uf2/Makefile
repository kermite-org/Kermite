CXX = g++
CXX_FLAGS = -Isrc -std=gnu++14
LD_FLAGS = -Wl,-search_paths_first -Wl,-headerpad_max_install_names

CPP_SRCS = src/main.cpp

BUILD_DIR = build
OBJ_DIR = build/obj

EXE = $(BUILD_DIR)/elf2uf2

OBJS = $(addprefix $(OBJ_DIR)/, $(CPP_SRCS:.cpp=.cpp.obj)) 

build: $(EXE)

$(EXE): $(OBJS)
	@echo "linking"
	@mkdir -p $(dir $@)
	@$(CXX) $(LD_FLAGS) $< -o $@
	@echo "output: $(EXE)"

$(OBJ_DIR)/%.cpp.obj: %.cpp
	@echo "compiling $<"
	@mkdir -p $(dir $@)
	@$(CXX) $(CXX_FLAGS) -o $@ -c $<
	

clean:
	rm -rf build

.PHONY: build
