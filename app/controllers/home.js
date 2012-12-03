var ThinAir = require('thinair'),
    spawn = require('child_process').spawn,
    fs = require('fs'),
    path = require('path'),
    Magician = require('magician');

module.exports = ThinAir.createController({
    setup: function(done) {
        this.Websites = this.repositories.Websites;
        this.names = [];
        done();
    },

    index: function(req, res, params) {
        this.sendTemplate(req, res, 'index', params);   
    },

    history: function(req, res, params) {
        if (((params.post) && (params.post.url)) || (typeof params.domain !== undefined)) {
            var domain = ((params.post) && (params.post.url)) ? this.helpers.watch.getDomainFromUrl(params.post.url) : params.domain,
                that = this;

            if (!url) var url = 'http://' + domain;

            this.Websites.getOneByDomain(domain, function(website) {
               if (website) {
                   fs.readdir(path.join(__dirname, '../../public/screenshots'), function(err, files) {
                       var screenshots = [];
                        files.forEach(function(file) {
                            if ((file.indexOf(domain.replace('.', '')) != -1) && (file.indexOf('_cropped') != -1)) {
                                var file_split = file.split('_'),
                                    date = file_split[1],
                                    time = file_split[2].replace(/-/gi, ':'),
                                    full_date = date + ' ' + time;

                                screenshots.push({ file: file, date: full_date });
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
                           params.error = 'Your website has been added to the list, please come back in 30 minutes!';
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
        var that = this;

        this.Websites.getAll(function(websites) {
            var outputString = '',
                that = this,
                i = 0;

            websites.forEach(function(website) {
                i = i + 1;
                var phantomjs = spawn('/usr/local/bin/phantomjs', ['/home/ubuntu/watch/screenshot.js', website.url]),
                    that = this;

                phantomjs.stdout.on('data', function (data) {
                    if (!that.names) that.names = [];
                    that.names[website.domain] = data.toString().replace("\n", "");

                    console.log('stdout: ' + data);

                    i = i - 1;
                    if (i <= 0) {
                        console.log('generate go!');
                        generateScreenshots(req, res, params);
                    }
                });

                phantomjs.stderr.on('data', function (data) {
                    console.log('stderr: ' + data);
                    i = i - 1;
                });

//                phantomjs.on('exit', function (code) {
//                });
            });
        });
    }
});

function generateScreenshots(req, res, params) {
    names.forEach(function(name) {
        params.name = name;

        if (name.indexOf('fail') !== -1) {
            var split = name.split(' '),
                name = split[1];

            console.log('split', split);

            fs.createReadStream(path.join(__dirname, '../../public/img/offline.jpg'))
                .pipe(fs.createWriteStream(path.join(__dirname, '../../public/screenshots/' + name + '.png')));

        } else {
            var image = new Magician(
                path.join(__dirname, '../../public/screenshots/' + name + '.png'),
                path.join(__dirname, '../../public/screenshots/' + name + '_cropped.png'));

            image.crop({x: 0, y: 0, width: 1080, height: 720}, function(err) {
//                       if (err) console.error('Magician error: ', err);
            });

            console.log('Took screenshot: ', name);
        }
    });

    res.writeHead(200, {'Content-Type': 'text/plain' });
    res.end('status');
}