globalThis.process = { env: Deno.env.toObject() };
try {
  if (!globalThis.global) {
    Object.defineProperty(globalThis, 'global', {
      value: globalThis,
      writable: false,
      enumerable: false,
      configurable: true
    });
  }
} catch (e) {
  // global is already defined or read-only, ignore
}