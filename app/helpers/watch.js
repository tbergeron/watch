var url_parse = require('url').parse;

module.exports = {
    getDomainFromUrl: function(url) {
        var parsed_url = url_parse(url);
        return parsed_url.host;
    }
}