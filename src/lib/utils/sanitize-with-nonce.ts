import DOMPurify from 'dompurify';

/**
 * Configure DOMPurify to add nonce attributes to sanitized content
 */
export function sanitizeWithNonce(content: string, nonce: string): string {
  // Configure DOMPurify hooks to add nonce to style and script tags
  if (typeof window !== 'undefined') {
    // Add nonce to allowed attributes
    DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
      if (data.attrName === 'nonce') {
        data.forceKeepAttr = true;
      }
    });
    
    // Add nonce to script and style elements
    DOMPurify.addHook('afterSanitizeElements', (node) => {
      if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE') {
        node.setAttribute('nonce', nonce);
      }
    });
  }
  
  // Sanitize with configured settings
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'p', 'strong', 'em', 'u', 'blockquote', 
      'li', 'ul', 'ol', 'div', 'span', 'br', 
      'a', 'code', 'pre', 'table', 'thead', 
      'tbody', 'tr', 'td', 'th', 'img', 'svg', 'path'
    ],
    ALLOWED_ATTR: [
      'class', 'id', 'href', 'target', 'rel', 
      'src', 'alt', 'width', 'height', 'stroke', 
      'fill', 'viewBox', 'stroke-linecap', 
      'stroke-linejoin', 'stroke-width', 'd',
      'nonce'
    ],
    FORBID_TAGS: [
      'script', 'object', 'embed', 'iframe', 
      'form', 'input', 'meta', 'link', 'style'
    ],
    FORBID_ATTR: [
      'onclick', 'onload', 'onerror', 'onmouseover', 
      'onfocus', 'onblur', 'onchange', 'onsubmit',
      'style' // Forbid inline styles
    ],
    KEEP_CONTENT: true,
    SAFE_FOR_TEMPLATES: true
  });
  
  // Clean up hooks after use
  if (typeof window !== 'undefined') {
    DOMPurify.removeAllHooks();
  }
  
  return sanitized;
}

/**
 * Transform markdown-like syntax to HTML with proper escaping
 */
export function transformMarkdownToHTML(content: string): string {
  return content
    // Headers
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mb-4 mt-8">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-white mb-3 mt-6">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-white mb-2 mt-4">$1</h3>')
    // Special callouts
    .replace(/^> \*\*💡 (.*?)\*\* (.*$)/gim, '<div class="bg-purple-500/10 border-l-4 border-purple-500 p-4 my-4"><p class="text-purple-400 font-semibold flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>$1</p><p class="text-gray-300 mt-1">$2</p></div>')
    // Regular blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-600 pl-4 my-4 text-gray-400">$1</blockquote>')
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // List items
    .replace(/^- (.*$)/gim, '<li class="ml-6 my-1">$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^/g, '<p class="mb-4">')
    .replace(/$/g, '</p>');
}