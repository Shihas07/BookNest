
const Handlebars = require('handlebars');

// Define Handlebars helper to generate a sequence of numbers
Handlebars.registerHelper('seq', function(start, end, block) {
    let accum = '';
    for(let i = start; i <= end; ++i) {
        accum += block.fn(i);
    }
    return accum;
});

module.exports = Handlebars;