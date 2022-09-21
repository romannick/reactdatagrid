export function notifier(defaultValue) {
    let lastValue = defaultValue;
    let listeners = [];
    function fn(value) {
        lastValue = value;
        listeners.forEach(listener => listener(lastValue));
    }
    fn.get = () => {
        return lastValue;
    };
    fn.onCalled = (listener) => {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    };
    fn.destroy = () => {
        listeners.length = 0;
    };
    return fn;
}
