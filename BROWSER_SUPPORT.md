# VibeLux Browser Support

## Minimum Browser Requirements

### Desktop Browsers
- Chrome 80+ (recommended)
- Firefox 75+
- Safari 13+
- Edge 80+

### Mobile Browsers
- Chrome Mobile 80+
- Safari iOS 13+

## Required Features
- WebGL 1.0 (WebGL 2.0 preferred)
- ES2015+ JavaScript
- CSS Grid & Flexbox
- Local Storage
- Web Workers (optional, for performance)

## Polyfilled Features
- Promise (required)
- Object.assign (required)
- Array.from (required)
- Array.prototype.includes (required)
- String.prototype.includes (required)
- Map (required)
- Set (required)
- Symbol (required)
- IntersectionObserver (optional)
- ResizeObserver (optional)
- MutationObserver (optional)
- requestAnimationFrame (required)
- fetch (required)
- AbortController (optional)
- URLSearchParams (required)
- CSS.supports (optional)
- CSS custom properties (optional) - Use postcss-custom-properties
- WebGL (required) - Required for Forge viewer
- WebGL2 (optional) - Preferred for performance

## Testing Browser Compatibility

Run the following in browser console:
```javascript
// Check WebGL
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
console.log('WebGL:', !!gl);

// Check WebGL2
const gl2 = canvas.getContext('webgl2');
console.log('WebGL2:', !!gl2);

// Check other features
console.log('IntersectionObserver:', typeof IntersectionObserver !== 'undefined');
console.log('ResizeObserver:', typeof ResizeObserver !== 'undefined');
console.log('CSS Grid:', CSS.supports('display', 'grid'));
console.log('CSS Custom Properties:', CSS.supports('--test', '0'));
```
