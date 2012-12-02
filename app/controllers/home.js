var ThinAir = require('thinair'),
    spawn = require('child_process').spawn,
    fs = require('fs'),
    im = require("node-imagemagick");

module.exports = ThinAir.createController({
    setup: function(done) {
        this.Websites = this.repositories.Websites;
        done();
    },

    index: function(req, res, params) {
        this.sendTemplate(req, res, 'index', params);   
    },

    form_request: function(req, res, params) {
        if ((this.isPost(req)) && (url = params.post.url)) {
            var domain = this.helpers.watch.getDomainFromUrl(url),
                that = this;

            this.Websites.getOneByDomain(domain, function(website) {
               if (website) {
                   fs.readdir('public/screenshots', function(err, files) {
                       var screenshots = [];
                        files.forEach(function(file) {
                            if ((file.indexOf(domain.replace('.', '')) != -1) && (file.indexOf('_cropped') != -1)) {
                                screenshots.push({ file: file });
                            }
                        });

                       params.screenshots = screenshots;
                       that.sendTemplate(req, res, 'view', params);
                   });
               } else {
                   that.Websites.save({ domain: domain, url: url }, function(savedWebsite, errors) {
                       if (errors) {
                           console.error(errors);
                       } else {
                           params.error = 'Your website has been added to the list! Come back in 60 minutes.';
                           that.sendTemplate(req, res, 'view', params);
                       }
                   });
               }
            });

        } else {
            params.error = 'Please try again';
            this.sendTemplate(req, res, 'view', params);
        }
    },

    take_screenshots: function(req, res, params) {
        this.Websites.getAll(function(websites) {
            var outputString = '';

            websites.forEach(function(website) {
                var phantomjs = spawn('phantomjs', ['screenshot.js', website.url]),
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

                    im.crop({
                        srcPath: '../../public/screenshots/' + name.toString().replace("\n", "") + '.png',
                        dstPath: '../../public/screenshots/' + name.toString().replace("\n", "") + '_cropped.png',
                        width : 320, height : 240, quality: 1, gravity: "North",
                    }, function(err, stdout, stderr) {
                        if (!err) {
                            console.error('ImageMagick error:', err);
                        }
                        console.log(stdout, stderr);
                    });

                    console.log('Took screenshot: ', name);
                });
            });
        });
    }
});