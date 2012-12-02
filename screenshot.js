var system = require('system'),
    fs = require('fs');

if (url = system.args[1]) {
    var page = new WebPage();

    page.open(url, function (status) {
        var date = new Date(),
            filename = url.replace('http://www.', ''),
            filename = filename.replace('http://', ''),
            filename = filename.replace(/[:/.?=]/g, ''),
            filename = filename + '_' + getFullDate(date);

        page.render('public/screenshots/' + filename + '.png');

        console.log(filename);

        phantom.exit();
    });
}

function getFullDate(d){
    function pad(n){return n<10 ? '0'+n : n}
    return d.getFullYear()+'-'
        + pad(d.getMonth()+1)+'-'
        + pad(d.getDate())+'_'
        + pad(d.getHours())+'-'
        + pad(d.getMinutes())+'-'
        + pad(d.getSeconds())+'';
}