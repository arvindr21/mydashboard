window.dash = window.dash || {};
var db = require('diskdb'),
    bcrypt = require('bcrypt-nodejs');

db = db.connect('collections', ['users', 'settings']);

dash.registerUser = function(name, userid, password) {

    /*
    *  response code : 0 - User with this id already exists
    *  response code : 1 - Sucessfully registered and User has already filled the settings
    *  response code : 2 - Sucessfully registered and User has not filled the settings
    */

    if (db.users.findOne({
        userid: userid
    })) return 0; 

    // save the user to DB
    var savedUser = db.users.save({
        name: name,
        userid: userid,
        password: bcrypt.hashSync(password)
    });
    return populateUser(savedUser);
};

dash.authUser = function(userid, password) {
    
    /*
    *  response code : 0 - User does not exists
    *  response code : 1 - Sucessfully logged in and User has already filled the settings
    *  response code : 2 - Sucessfully logged in and User has not filled the settings
    *  response code : 3 - Authentication failed
    */

    // fetch the user from DB
    var user = db.users.findOne({
        userid: userid
    });
    if (user) {
        if (bcrypt.compareSync(password, user.password)) {
            return populateUser(user);
        } else {
            return 3;
        }

    } else {
        return 0;
    }
};

dash.signOut = function () {

    /*
    *  Clean localstorage
    */

	localStorage.removeItem('user');
	localStorage.removeItem('settings');
	return 1;
};

var populateUser = function(user) {
    
    /*
    *  Create a "Session"
    */

    delete user.password; // remove password before creating a "session"

    // if local storage has a user object, the user is logged in 'Duh!'
    localStorage.setItem('user', JSON.stringify(user));

    // check if the user has completed the settings
    var setg = db.settings.findOne({
        uid: user._id
    });
    if (setg) {
        localStorage.setItem('settings', JSON.stringify(setg.settings));
        return 1;
    } else {
        return 2;
    }
};

