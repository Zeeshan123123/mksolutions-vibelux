// Runtime polyfill for self global
if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }
} else if (typeof global !== 'undefined') {
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
  if (typeof globalThis === 'undefined') {
    global.globalThis = global;
  }
} else if (typeof window !== 'undefined') {
  if (typeof window.self === 'undefined') {
    window.self = window;
  }
}