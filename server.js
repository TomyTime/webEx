var http = require("http"),
    superagent = require("superagent"),
    phantom = require('phantom'),
    async = require("async"),
    cheerio = require("cheerio"),
    dateFormat = require('dateformat'),
    fs = require("fs");

var startDate = new Date(), //开始时间
    endDate = new Date(startDate.getTime() - 1000 * 60 * 60 * 24), //结束时间
    catchFirstUrl = 'http://srh.bankofchina.com/search/whpj/search.jsp?nothing=' + dateFormat(endDate, 'yyyy-mm-dd') + '&erectDate=' + dateFormat(endDate, 'yyyy-mm-dd') + '&pjname=1330', //入口页面
    deleteRepeat = {}, //去重哈希数组
    catchData = [], //存放爬取数据
    pageUrls = []; //存放收集文章页面网站

// 判断日期是否重复
function isRepeat(dd) {
    if (deleteRepeat[dd] == undefined) {
        deleteRepeat[dd] = 1;
        return 0;
    } else if (deleteRepeat[dd] == 1) {
        return 1;
    }
}

// 主start程序
function start() {
    phantom.create().then(function(ph) {
        ph.createPage().then(function(page) {
            page.open(catchFirstUrl)
                .then(function(status) {
                    page.property('content').then(function(content) {
                        var pageTotal = content.replace(/^[\s\S]*>共/gm, '')
                            .replace(/页<\/li><li[\s\S]*$/gm, '');
                        page.close();
                        ph.exit();

                        try {
                            pageTotal = parseInt(pageTotal);
                        } catch (err) {
                            pageTotal = 0;
                            console.log(err);
                        }
                        for (var i = 1; i <= pageTotal; i++) {
                            pageUrls.push(catchFirstUrl + '&page=' + i);
                        }
                        console.log("pageUrls.length = ", pageUrls.length);
                        var curCount = 0;
                        var reptileMove = function(url, callback) {
                            //延迟毫秒数
                            console.log('reptileMove');
                            var delay = parseInt((Math.random() * 30000000) % 1000, 10);
                            curCount++;
                            console.log('现在的并发数是', curCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');

                            superagent.get(url)
                                .end(function(err, pres) {
                                    // 常规的错误处理
                                    if (err) {
                                        console.log(err);
                                    }
                                    var $ = cheerio.load(pres.text),
                                        $trs = $('.BOC_main.publish tr');
                                    $trs.each(function(i, tr) {
                                        if ($(tr).find('td').eq(7).text()) {
                                            catchData.push(
                                                $(tr).find('td').eq(7).text() + ", " + $(tr).find('td').eq(1).text()
                                            );
                                        }
                                    });
                                });
                            setTimeout(function() {
                                curCount--;
                                callback(null, url + 'Call back content');
                            }, delay);
                        };

                        // 使用async控制异步抓取
                        // mapLimit(arr, limit, iterator, [callback]);
                        // 异步回调
                        async.mapLimit(pageUrls, 5, function(url, callback) {
                            reptileMove(url, callback);
                        }, function(err, result) {
                            console.log('-----');
                            fs.open("data.txt", "w", 0644, function(e, fd) {
                                if (e) throw e;
                                fs.write(fd, catchData.join('\r\n'), 0, 'utf8', function(e) {
                                    if (e) throw e;
                                    fs.closeSync(fd);
                                    setTimeout(file2sql, 1000);
                                })
                            });
                            console.log('-----');
                        });
                    })
                })
        });
    });
}
//开始
start();

function file2sql() {
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
}
