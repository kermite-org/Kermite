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
      prevTimeStamp: number;
    };
// | {
//     //deprecated resolve event
//     type: 'R';
//     keyId: string;
//     trigger: InputTrigger;
//     timeStamp: number;
//   };

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
  | 'tap_drill_ddd'
  | 'head_down';

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
  //:: start of sequence | blank time longer than holdTimeMs
  //D: down event
  //U: up event
  //_: blank time longer than holdTimeMs
  down: 'D',
  down_w: 'D_',
  up: 'U',
  up_w: 'U_',
  head_down: ':D',
  tap: ':DU',
  tap_w: ':DU_',
  tap_redown: ':DUD',
  tap_rehold: ':DUD_',
  tap_dtap: ':DUDU',
  tap_dtap_tritap: ':DUDUDU',
  hold: ':D_',
  dtap: ':DUDU',
  dtap_w: ':DUDU_',
  tritap: ':DUDUDU',
  tap_drill_d: ':D',
  tap_drill_dd: ':DUD',
  tap_drill_ddd: ':DUDUD'
};

const targetTriggersMap: { [keyId: string]: InputTrigger[] } = {
  k0: ['down'],
  k1: ['down', 'up'],
  k2: ['head_down', 'tap', 'hold', 'tap_redown', 'tap_rehold'],
  k3: ['up_w'],
  k4: ['hold', 'tap_w', 'dtap'],
  k5: ['hold', 'tap_w', 'dtap_w', 'tritap'],
  k6: ['hold', 'tap', 'tap_dtap', 'tap_dtap_tritap'],
  k7: ['hold', 'tap_drill_d', 'tap_drill_dd', 'tap_drill_ddd']
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
        str += ':';
        str += ev.type;
      } else {
        if (ev.type === 'D' || ev.type === 'U') {
          const prevEvent = events[idx - 1];
          const pos = ev.timeStamp - prevEvent.timeStamp;
          if (pos > holdTimeMs) {
            str += ':';
          }
          str += ev.type;
        } else if (ev.type === 'T') {
          const prevEvent = events[idx - 1];
          const pos0 = ev.prevTimeStamp - prevEvent.timeStamp;
          const pos1 = ev.timeStamp - prevEvent.timeStamp;
          if (pos0 < holdTimeMs && holdTimeMs <= pos1) {
            str += '_';
          } else {
            str += '.';
          }
        }
        // } else if (ev.type === 'R') {
        //   str += '!';
        // }
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
    // if (events[events.length - 1].type !== 'T') {
    //   console.log(eventsPattern);
    // }
    console.log(eventsPattern);
    const targetTriggers = targetTriggersMap[targetKeyId].slice().reverse();
    for (const trigger of targetTriggers) {
      const refPattern = triggerMatcherPatternMap[trigger];
      if (eventsPattern.endsWith(refPattern)) {
        // EventsFuncs.dumpEventQueue(events);
        // console.log(eventsPattern);
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
        const targetEvents = events.filter(
          ev => ev.keyId === targetKeyId || ev.keyId === undefined
        );
        return PatternEventsResolver.detectEventsByPattern(
          targetEvents,
          targetKeyId
        );
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

  export function createTickerEvent(lastTime: number): ICoreEvent {
    return {
      type: 'T',
      keyId: undefined,
      timeStamp: getSystemTickMs(),
      prevTimeStamp: lastTime
    };
  }

  // export function createResolveEvent_Deprecated(
  //   keyId: string,
  //   trigger: InputTrigger
  // ): ICoreEvent {
  //   return {
  //     type: 'R',
  //     timeStamp: getSystemTickMs(),
  //     keyId,
  //     trigger
  //   };
  // }
}

namespace layer1 {
  const local = new (class {
    events: ICoreEvent[] = [];
    prevTimeStamp: number = 0;
  })();

  export function reset() {
    local.events = [];
    local.prevTimeStamp = 0;
  }

  export function processEvents() {
    const { events } = local;
    const resolved = EventsResolver.tryToResolveTriggerEvent(events);
    if (resolved) {
      const { trigger, keyId } = resolved;
      console.log(`  [trigger detected] ${trigger} ${keyId}`);
      // events.push(CoreEventHelpers.createResolveEvent(keyId, trigger));
    }
  }

  export function handleTicker() {
    const ev = CoreEventHelpers.createTickerEvent(local.prevTimeStamp);
    local.events.push(ev);
    processEvents();
    local.events.pop();
    local.prevTimeStamp = ev.timeStamp;
  }

  export function handleKey(keyId: string, isDown: boolean) {
    const ev = CoreEventHelpers.createKeyEvent(keyId, isDown);
    local.events.push(ev);
    processEvents();
    local.prevTimeStamp = ev.timeStamp;
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
