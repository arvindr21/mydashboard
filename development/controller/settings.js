window.dash = window.dash || {};
var db = require('diskdb');

db = db.connect('collections', ['users', 'settings']);

dash.saveSetting = function(uid, settings) {
    // upsert
    var upd = db.settings.update({
        uid: uid
    }, {
        uid: uid,
        settings: settings
    }, {
        multi: false,
        upsert: true
    });

    if (upd.updated > 0 || upd.inserted > 0) {
    	localStorage.setItem('settings', JSON.stringify(settings));
        return 1;
    } else {
        return 0;
    }
};
