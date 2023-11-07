// https://stackoverflow.com/a/25345746
function wait(
    ms: number,
    value: ReturnType<typeof Promise.resolve>,
    { signal }: { signal?: AbortSignal } = {},
) {
    return new Promise((resolve, reject) => {
        const listener = () => {
            clearTimeout(timer);
            reject(signal?.reason);
        };

        signal?.throwIfAborted();

        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", listener);
            resolve(value);
        }, ms);

        signal?.addEventListener("abort", listener);
    });
}

export { wait as default };
