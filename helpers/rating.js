const hbs = require('hbs');

hbs.registerHelper('range', function(start, end, options) {
  let result = '';
  for (let i = start; i <= end; i++) {
    result += options.fn(i);
  }
  return result;
});
