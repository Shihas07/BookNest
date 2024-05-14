const handlebars = require('handlebars');

handlebars.registerHelper('compareStatus', function(status, target, options) {
    return (status === target) ? options.fn(this) : options.inverse(this);
});