//create new webpage object
var page = new webpage();

//load the page
page.open('http://espn.go.com/nfl', function (status) {
    //fire callback to take screenshot after load complete
    page.render('espn.png');
    //finish
    phantom.exit();
});
