// Minimal server polyfills: only ensure `self` exists, avoid defining window/document

if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }
} else if (typeof global !== 'undefined') {
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
  if (typeof globalThis === 'undefined') {
    // @ts-ignore
    global.globalThis = global;
  }
}

try {
  // @ts-ignore
  if (typeof self === 'undefined' && typeof global !== 'undefined') {
    // @ts-ignore
    global.self = global;
  }
} catch {}

module.exports = {};