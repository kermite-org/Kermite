type ICoreEvent =
  | {
      type: 'D' | 'U';
      keyId: string;
      timeStamp: number;
    }
  | {
      type: 'T';
      keyId: undefined;
      timeStamp: number;
    }
  | {
      type: 'R';
      keyId: string;
      trigger: InputTrigger;
      timeStamp: number;
    };

type InputTrigger =
  | 'down'
  | 'down_w'
  | 'up'
  | 'up_w'
  | 'tap'
  | 'tap_w'
  | 'tap_redown'
  | 'tap_rehold'
  | 'hold'
  | 'dtap'
  | 'dtap_w'
  | 'tritap'
  | 'tap_dtap'
  | 'tap_dtap_tritap'
  | 'tap_drill_d'
  | 'tap_drill_dd'
  | 'tap_drill_ddd';

type IResolveResult =
  | {
      result: 'resolved';
      keyId: string;
      trigger: InputTrigger;
    }
  | undefined;

const triggerMatcherPatternMap: {
  [trigger in InputTrigger]: string;
} = {
  //key event patterns
  //D: down event
  //U: up event
  //.: blank time shorter than tapTimeMs
  //_: blank time longer than holdTimeMs
  down: 'D',
  down_w: 'D_',
  up: 'U',
  up_w: 'U_',
  tap: 'D.U',
  tap_w: 'D.U_',
  tap_redown: 'D.U!.D',
  tap_rehold: 'D.U!.D_',
  tap_dtap: 'D.U!.D.U',
  tap_dtap_tritap: 'D.U!.D.U!.D.U',
  hold: 'D_',
  dtap: 'D.U.D.U',
  dtap_w: 'D.U.D.U_',
  tritap: 'D.U.D.U.D.U',
  tap_drill_d: 'D',
  tap_drill_dd: 'D!.U.D',
  tap_drill_ddd: 'D!.U.D!.U.D'
};

const targetTriggersMap: { [keyId: string]: InputTrigger[] } = {
  k0: ['down'],
  k1: ['down', 'up'],
  k2: ['tap', 'hold', 'tap_redown'],
  k3: ['hold', 'tap_w', 'dtap'],
  k4: ['hold', 'tap_w', 'dtap_w', 'tritap'],
  k5: ['tap', 'hold', 'tap_dtap', 'tap_dtap_tritap'],
  k6: ['tap_drill_d', 'tap_drill_dd', 'tap_drill_ddd'],
  k7: ['up_w']
};

const timeConstants = {
  tickerInterval: 50,
  tapTime: 200,
  holdTime: 200
};

namespace EventsFuncs {
  export function dumpEventQueue(events: ICoreEvent[]) {
    const originTime = events[0].timeStamp;
    const str = events
      .map(ev => {
        if (ev.type === 'D' || ev.type === 'U') {
          return `${ev.type}${ev.keyId}~${ev.timeStamp - originTime}`;
        } else if (ev.type === 'T') {
          return `${ev.type}~${ev.timeStamp - originTime}`;
        }
      })
      .join('|');
    console.log(str);
  }

  export function dumpEventQueue2(events: ICoreEvent[]) {
    console.log(JSON.stringify(events, null, ' '));
  }
}

function makeResolveResult(
  keyId: string,
  trigger: InputTrigger
): IResolveResult {
  return {
    result: 'resolved',
    keyId,
    trigger
  };
}

namespace PatternEventsResolver {
  function patternizeEvents(
    events: ICoreEvent[],
    tapTimeMs: number,
    holdTimeMs: number
  ) {
    let str = '';
    events.forEach((ev, idx) => {
      if (idx === 0) {
        str += ev.type;
      } else {
        const prev = events[idx - 1];
        const dur = ev.timeStamp - prev.timeStamp;
        if (ev.type === 'D' || ev.type === 'U') {
          if (dur < tapTimeMs) {
            str += '.';
          } else if (dur > holdTimeMs) {
            str += '_';
          }
          str += ev.type;
        } else if (ev.type === 'T') {
          if (dur > holdTimeMs) {
            str += '_';
          } else {
            str += '.';
          }
        } else if (ev.type === 'R') {
          str += '!';
        }
      }
    });
    return str;
  }

  export function detectEventsByPattern(
    events: ICoreEvent[],
    targetKeyId: string
  ): IResolveResult {
    const eventsPattern = patternizeEvents(
      events,
      timeConstants.tapTime,
      timeConstants.holdTime
    );
    if (events[events.length - 1].type !== 'T') {
      console.log(eventsPattern);
    }
    const targetTriggers = targetTriggersMap[targetKeyId].slice().reverse();
    for (const trigger of targetTriggers) {
      const refPattern = triggerMatcherPatternMap[trigger];
      if (eventsPattern.endsWith(refPattern)) {
        EventsFuncs.dumpEventQueue(events);
        console.log(eventsPattern);
        return makeResolveResult(targetKeyId, trigger);
      }
    }
  }
}

namespace EventsResolver {
  // function fallbackMatcher(events: ICoreEvent[]): boolean {
  //   return false;
  // }

  // function matchHeadType(events: ICoreEvent[], type: ICoreEventType) {
  //   const ev = events[0];
  //   return ev && ev.type === type;
  // }

  // function matchTailType(events: ICoreEvent[], type: ICoreEventType) {
  //   const ev = events[events.length - 1];
  //   return ev && ev.type === type;
  // }

  // function triggerMatcher_down(events: ICoreEvent[]): boolean {
  //   const e0 = events[0];
  //   if (events.length === 1 && e0 && e0.type === 'D') {
  //     return true;
  //   }
  //   return false;
  // }

  // function triggerMatcher_up(events: ICoreEvent[]): boolean {
  //   const e0 = events[events.length - 1];
  //   if (e0 && e0.type === 'U') {
  //     return true;
  //   }
  //   return false;
  // }

  // function triggerMatcher_tap(events: ICoreEvent[]): boolean {
  //   const e0 = events[0];
  //   const e1 = events[1];
  //   if (
  //     events.length === 2 &&
  //     e0 &&
  //     e1 &&
  //     e0.type === 'D' &&
  //     e1.type === 'U' &&
  //     e1.timeStamp < 300
  //   ) {
  //     return true;
  //   }
  //   return false;
  // }

  // function triggerMatcher_hold(events: ICoreEvent[]): boolean {
  //   const e0 = events[0];
  //   const e1 = events[1];
  //   if (
  //     events.length === 2 &&
  //     e0 &&
  //     e1 &&
  //     e0.type === 'D' &&
  //     e1.type === 'T' &&
  //     e1.timeStamp > 300
  //   ) {
  //     return true;
  //   }
  //   return false;
  // }

  // const triggerMatcherFunctionMap: {
  //   [trigger in InputTrigger]: (events: ICoreEvent[]) => boolean;
  // } = {
  //   down: triggerMatcher_down,
  //   down_w: fallbackMatcher,
  //   up: triggerMatcher_up,
  //   up_w: fallbackMatcher,
  //   tap: triggerMatcher_tap,
  //   tap_w: fallbackMatcher,
  //   tap_rehold: fallbackMatcher,
  //   hold: triggerMatcher_hold,
  //   dtap: fallbackMatcher,
  //   dtap_w: fallbackMatcher,
  //   tritap: fallbackMatcher
  // };

  export function tryToResolveTriggerEvent(
    events: ICoreEvent[]
  ): IResolveResult {
    // if (events[events.length - 1].type !== 'T') {
    //   EventsFuncs.dumpEventQueue(timeRelativifyEvents(events));
    // }
    // console.log(events);

    if (1) {
      //single key match
      const targetKeyId = events
        .slice()
        .reverse()
        .map(a => (a as any).keyId! as string)
        .find(a => !!a);

      if (targetKeyId) {
        const events2 = events.filter(
          ev => ev.keyId === targetKeyId || ev.keyId === undefined
        );
        const res0 = PatternEventsResolver.detectEventsByPattern(
          events2,
          targetKeyId
        );
        if (res0) {
          return res0;
        }
      }
    }
    return undefined;
  }
}

namespace CoreEventHelpers {
  export function getSystemTickMs(): number {
    return Date.now();
  }

  export function createKeyEvent(keyId: string, isDown: boolean): ICoreEvent {
    return {
      type: isDown ? 'D' : 'U',
      keyId,
      timeStamp: getSystemTickMs()
    };
  }

  export function createTickerEvent(): ICoreEvent {
    return { type: 'T', keyId: undefined, timeStamp: getSystemTickMs() };
  }

  export function createResolveEvent(
    keyId: string,
    trigger: InputTrigger
  ): ICoreEvent {
    return {
      type: 'R',
      timeStamp: getSystemTickMs(),
      keyId,
      trigger
    };
  }
}

namespace layer1 {
  const local = new (class {
    events: ICoreEvent[] = [];
  })();

  export function reset() {
    local.events = [];
  }

  export function processEvents() {
    const { events } = local;
    const resolved = EventsResolver.tryToResolveTriggerEvent(events);
    if (resolved) {
      const { trigger, keyId } = resolved;
      console.log(`  [trigger detected] ${trigger} ${keyId}`);
      events.push(CoreEventHelpers.createResolveEvent(keyId, trigger));
    }
  }

  export function handleTicker() {
    local.events.push(CoreEventHelpers.createTickerEvent());
    processEvents();
    local.events.pop();
  }

  export function handleKey(keyId: string, isDown: boolean) {
    local.events.push(CoreEventHelpers.createKeyEvent(keyId, isDown));
    processEvents();
  }
}

namespace layer0 {
  const keyCodeToKeyIdMap: { [keyCode: number]: string } = {
    81: 'k0',
    87: 'k1',
    69: 'k2',
    82: 'k3',
    65: 'k4',
    83: 'k5',
    68: 'k6',
    70: 'k7'
  };

  function handleKeyEvent(event: KeyboardEvent) {
    if (event.keyCode === 32) {
      layer1.reset();
      console.log('reset');
    }
    if (event.repeat) {
      return;
    }
    const keyId = keyCodeToKeyIdMap[event.keyCode];
    if (keyId) {
      const isDown = event.type === 'keydown';
      layer1.handleKey(keyId, isDown);
    }
  }

  export function start() {
    console.log('start');
    document.addEventListener('keydown', handleKeyEvent);
    document.addEventListener('keyup', handleKeyEvent);

    setInterval(layer1.handleTicker, timeConstants.tickerInterval);
  }
}

layer0.start();
