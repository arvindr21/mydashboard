/*
 * Weather
 * Copyright (c) 2014 Fatih Cetinkaya (http://github.com/cmfatih/weather)
 * For the full copyright and license information, please view the LICENSE.txt file.
 */

// Init reqs
/* jslint node: true */
'use strict';

var request = require('request'),
    qs      = require('querystring'),
    xml2JS  = require('xml2js');

// Init the module
exports = module.exports = function() {

  var xmlParser     = new xml2JS.Parser({charkey: 'C$', attrkey: 'A$', explicitArray: true}),
      defLang       = 'en-US',
      defDegreeType = 'F',
      defTimeout    = 10000,
      findUrl       = 'http://weather.service.msn.com/find.aspx',
      find;         // finds and gets weather information - function

  find = function find(options, callback) {

    if(typeof callback !== 'function')
      callback = function callback(err, result) { return err || result; };

    if(!options || typeof options !== 'object')
      return callback('Invalid options!');

    if(!options.search)
      return callback('Missing search input!');

    var result,
        lang       = options.lang || defLang,
        degreeType = options.degreeType || defDegreeType,
        timeout    = options.timeout || defTimeout,
        search     = qs.escape(''+options.search),
        reqUrl     = findUrl + '?weadegreetype=' + (''+degreeType) + '&culture=' + (''+lang) + '&weasearchstr=' + search;

    request.get({url: reqUrl, timeout: timeout}, function(err, res, body) {

      if(err) return callback(err);
      if(res.statusCode !== 200) return callback('Request failed (' + res.statusCode + ')');

      xmlParser.parseString(body, function(err, resultJSON) {
        if(err) return callback(err);

        if(!resultJSON.weatherdata || !resultJSON.weatherdata.weather)
          return callback('Unexpected error! Invalid content.');

        if(resultJSON.weatherdata.weather['A$'] && resultJSON.weatherdata.weather['A$'].errormessage)
          return callback(resultJSON.weatherdata.weather['A$'].errormessage);

        if(!(resultJSON.weatherdata.weather instanceof Array)) {
          return callback('Unexpected error! Missing weather info.');
        }

        var weatherLen = resultJSON.weatherdata.weather.length,
            weatherItem;
        for(var i = 0; i < weatherLen; i++) {

          if(typeof resultJSON.weatherdata.weather[i]['A$'] !== 'object')
            continue;

          weatherItem = {
            location: {
              name: resultJSON.weatherdata.weather[i]['A$']['weatherlocationname'],
              zipcode: resultJSON.weatherdata.weather[i]['A$']['zipcode'],
              lat: resultJSON.weatherdata.weather[i]['A$']['lat'],
              long: resultJSON.weatherdata.weather[i]['A$']['long'],
              timezone: resultJSON.weatherdata.weather[i]['A$']['timezone'],
              alert: resultJSON.weatherdata.weather[i]['A$']['alert'],
              degreetype: resultJSON.weatherdata.weather[i]['A$']['degreetype'],
              imagerelativeurl: resultJSON.weatherdata.weather[i]['A$']['imagerelativeurl']
              //url: resultJSON.weatherdata.weather[i]['A$']['url'],
              //code: resultJSON.weatherdata.weather[i]['A$']['weatherlocationcode'],
              //entityid: resultJSON.weatherdata.weather[i]['A$']['entityid'],
              //encodedlocationname: resultJSON.weatherdata.weather[i]['A$']['encodedlocationname']
            },
            current: null,
            forecast: null
          };

          if(resultJSON.weatherdata.weather[i]['current'] instanceof Array && resultJSON.weatherdata.weather[i]['current'].length > 0) {
            if(typeof resultJSON.weatherdata.weather[i]['current'][0]['A$'] === 'object') {
              weatherItem.current = resultJSON.weatherdata.weather[i]['current'][0]['A$'];

              weatherItem.current.imageUrl = weatherItem.location.imagerelativeurl + 'law/' + weatherItem.current.skycode + '.gif';
            }
          }

          if(resultJSON.weatherdata.weather[i]['forecast'] instanceof Array) {
            weatherItem.forecast = [];
            for(var k = 0; k < resultJSON.weatherdata.weather[i]['forecast'].length; k++) {
              if(typeof resultJSON.weatherdata.weather[i]['forecast'][k]['A$'] === 'object')
                weatherItem.forecast.push(resultJSON.weatherdata.weather[i]['forecast'][k]['A$']);
            }
          }

          if(!result) result = [];
          result.push(weatherItem);
        }

        return callback(undefined, result);
      });
    });
  };

  // Return
  return {
    find: find
  };
}();