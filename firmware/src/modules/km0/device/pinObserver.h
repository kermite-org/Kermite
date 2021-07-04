#pragma once

#define PIN_OBSERVER_EDGE_RISE 1
#define PIN_OBSERVER_EDGE_FALL 2

void pinObserver_observePin(int pin, void (*callback)(int, int));
void pinObserver_unobservePin(int pin);
