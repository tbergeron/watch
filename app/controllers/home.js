var ThinAir = require('thinair'),
    spawn = require('child_process').spawn,
    fs = require('fs'),
    path = require('path'),
    Magician = require('magician');

module.exports = ThinAir.createController({
    setup: function(done) {
        this.Websites = this.repositories.Websites;
        this.counter = 0;
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

                                screenshots.push({ file: file.replace('_cropped', ''), thumbnail: file, date: full_date });
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
        that.counter = 0;

        this.Websites.getAll(function(websites) {

            websites.forEach(function(website) {
                var phantomjs = spawn('/usr/local/bin/phantomjs', ['/home/ubuntu/watch/screenshot.js', website.url]);
                that.counter++;

                console.log('Browsing ', website.domain);

                phantomjs.stdout.on('data', function (data) {
                    that.counter--;
                    console.log('stdout:', data.toString());
                    var name = data.toString().replace("\n", "");

                    // if down
                    if (name.indexOf('fail') !== -1) {
                        var split = name.split(' '),
                            name = split[1],
                            name = name.replace('http://www.', ''),
                            name = name.replace('http://', ''),
                            name = name.replace(/[:/.?=]/g, ''),
                            name = name + '_' + getFullDate(new Date());

                        fs.createReadStream(path.join(__dirname, '../../public/img/offline.jpg'))
                            .pipe(fs.createWriteStream(path.join(__dirname, '../../public/screenshots/' + name + '.png')));
                    }
                    generateThumbnail(name, that.counter, res);
                });

                phantomjs.stderr.on('data', function (data) {
                    that.counter--;
                    console.log('stderr: ' + data);
                    generateThumbnail(null, counter, res);
                });

                phantomjs.on('exit', function (code) {
//                    console.log('Process closed:', code);
                });
            });
        });
    }
});

function getFullDate(d){
    function pad(n){return n<10 ? '0'+n : n}
    return d.getFullYear()+'-'
        + pad(d.getMonth()+1)+'-'
        + pad(d.getDate())+'_'
        + pad(d.getHours())+'-'
        + pad(d.getMinutes())+'-'
        + pad(d.getSeconds())+'';
}

function generateThumbnail(name, counter, res) {
    if (name) {
        console.log('generateThumbnail:', name);
        console.log('counter:', counter);

        var image = new Magician(
            path.join(__dirname, '../../public/screenshots/' + name + '.png'),
            path.join(__dirname, '../../public/screenshots/' + name + '_cropped.png'));

        image.crop({x: 0, y: 0, width: 260, height: 180}, function(err) {
            if (err) console.log('Magician error: ', err);
            else console.log('Cropped screenshot: ', name);

            generateThumbnail(null, counter, res);
        });
    } else {
        if (counter <= 0) {
            console.log('Done.');
            res.writeHead(200, {'Content-Type': 'text/plain' });
            res.end('status');
        }
    }
}