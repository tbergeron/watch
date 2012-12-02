var system = require('system'),
    fs = require('fs');

if (url = system.args[1]) {
    var page = new WebPage();
//    page.settings.userAgent = 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25';


    page.open(url, function (status) {
        var date = new Date(),
            filename = url.replace('http://www.', ''),
            filename = filename.replace('http://', ''),
            filename = filename.replace(/[:/.?=]/g, ''),
            filename = filename + '_' + getFullDate(date);

        console.log(filename);

        page.render('/home/ubuntu/watch/public/screenshots/' + filename + '.png');

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