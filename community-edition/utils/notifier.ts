export interface FunctionNotifier<T> {
  (value: T): void;
  get: () => T;
  onCalled: (listener: (v: T | null) => void) => VoidFunction;
}

export function notifier<VALUE>(defaultValue: VALUE): FunctionNotifier<VALUE> {
  let lastValue: VALUE = defaultValue;

  let listeners: Array<(value: VALUE) => void> = [];
  function fn(value: VALUE) {
    lastValue = value;
    listeners.forEach(listener => listener(lastValue));
  }

  fn.get = () => {
    return lastValue;
  };

  fn.onCalled = (listener: (v: VALUE | null) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };

  fn.destroy = () => {
    listeners.length = 0;
  };

  return fn as FunctionNotifier<VALUE>;
}
