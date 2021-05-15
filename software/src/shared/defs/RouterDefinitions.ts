import { LogicalKey } from '~/shared/defs/LogicalKey';

export const routerConstants = {
  RoutingChannelValueAny: 15,

  KeyCodeSourceValueNone: LogicalKey.LK_NONE,
  KeyCodeSourceValueAny: LogicalKey.LK_RoutingSource_Any,
  KeyCodeDestinationValueKeep: LogicalKey.LK_RoutingDestination_Keep,
  KeyCodeDestinationValueStop: LogicalKey.LK_RoutingDestination_Stop,

  ModifierSourceValueNone: 0,
  ModifierSourceValueAny: 255,
  ModifierDestinationValueKeep: 254,
};
