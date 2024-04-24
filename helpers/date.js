// Define a Handlebars helper function to format the date
const hbs = require('hbs');
const moment = require('moment');

hbs.registerHelper('getCurrentDate', function() {
    // Get the current date
    let currentDate = moment().format('YYYY-MM-DD');
    return currentDate;
});
