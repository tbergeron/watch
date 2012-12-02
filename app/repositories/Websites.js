var ThinAir = require('thinair');

module.exports = ThinAir.createRepository("websites", {
    getAll: function(callback) {
        this.find().toArray(function(err, websites) {
            if (err) console.error(err);
            return callback(websites ? websites : null);
        });
    },

    getOneByDomain: function(domain, callback) {
        this.baseFindOne({ domain: domain }, function(website) {
            callback(website);
        })
    },

    save: function(website, callback) {
        // baseSave save a new or updates an existing object
        this.baseSave(website, function(savedWebsite, validationErrors) {
            return callback(savedWebsite, validationErrors);
        });
    },

//    delete: function(code, callback) {
//        // baseDelete, removes an object from the collection
//        // based on first argument's conditions.
//        this.baseDelete({ code: code }, function(err) {
//            // returns an error if there's one
//            callback((err) ? err : true);
//        });
//    }
});