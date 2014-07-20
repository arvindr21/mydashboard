window.dash = window.dash || {};
var weather = require('weather-js');

dash.getWeather = function(location, callback) {
    weather.find({
        search: location
    }, function(err, result) {
        if (err) console.log(err);
        
        callback(result);
    });
}
