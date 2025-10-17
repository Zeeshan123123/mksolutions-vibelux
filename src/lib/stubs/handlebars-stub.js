// Minimal handlebars stub for build optimization
const compile = (template) => {
  return (context) => {
    // Simple template replacement
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] || '';
    });
  };
};

module.exports = {
  compile,
  create: () => ({ compile }),
  registerHelper: () => {},
  registerPartial: () => {},
  SafeString: class SafeString {
    constructor(string) {
      this.string = string;
    }
    toString() {
      return this.string;
    }
  }
};