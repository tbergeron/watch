var system = require('system'),
    fs = require('fs');

if (url = system.args[1]) {
    var page = new WebPage();

    page.open(url, function (status) {
        console.log('status', status);
        phantom.exit();
    });
}