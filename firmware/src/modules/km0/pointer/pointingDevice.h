#pragma once

#include "km0/types.h"

void pointingDevice_initialize();
void pointingDevice_update(int8_t *outDeltaX, int8_t *outDeltaY);