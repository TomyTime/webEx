var fs = require('fs');

var _data = [];
fs.readFile('data.txt', 'utf-8', function(err, data) {
    if (err) {
        console.error(err);
    } else {
        var v = data.split('\r\n');
        for (var i = 0, len = v.length; i < len; i++) {
            var _v = v[i].split(',');
            _data.push("INSERT INTO `nr`.`hit` (`dd`, `vv`) VALUES ('" + _v[0] + "', '" + _v[1] + "');");
        }
        console.log('-----');
        fs.open("sql.txt", "w", 0644, function(e, fd) {
            if (e) throw e;
            fs.write(fd, _data.join('\r\n'), 0, 'utf8', function(e) {
                if (e) throw e;
                fs.closeSync(fd);
            })
        });
        console.log('-----');
    }
});
