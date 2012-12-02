var ThinAir = require('thinair'),
    spawn = require('child_process').spawn;

module.exports = ThinAir.createController({
    index: function(req, res, params) {
        this.sendTemplate(req, res, 'index', params);   
    },

    // todo: this should loop on a database and take screenshots each X minutes
    take_screenshot: function(req, res, params) {
        if ((this.isPost(req)) && (params.post.url)) {
            var phantomjs = spawn('phantomjs', ['screenshot.js', params.post.url]),
                that = this,
                name = null;

            phantomjs.stdout.on('data', function (data) {
                name = data;
                console.log('stdout: ' + data);
            });

            phantomjs.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
            });

            phantomjs.on('exit', function (code) {
                params.name = name;
                that.sendTemplate(req, res, 'view', params);
            });
        } else {
            params.error = true;
            this.sendTemplate(req, res, 'view', params);
        }
    }
});