var http = require("http"),
    superagent = require("superagent"),
    cheerio = require("cheerio"),
    dateFormat = require('dateformat'),
    finalhandler = require('finalhandler'),
    Router = require('router'),
    db = require("./models/db.js");

var router = Router();
var server = http.createServer(function onRequest(req, res) {
    router(req, res, finalhandler);
});

var startDate = new Date(), //开始时间
    endDate = new Date(startDate.getTime()), //结束时间
    catchFirstUrl = 'http://srh.bankofchina.com/search/whpj/search.jsp?nothing=' + dateFormat(endDate, 'yyyy-mm-dd') + '&erectDate=' + dateFormat(startDate, 'yyyy-mm-dd') + '&pjname=1330', //入口页面
    catchData = [], //存放爬取数据
    pageUrls = []; //存放收集文章页面网站
var visitTime = +new Date();

router.get('/', function(req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        });
        catchData.length = 0;
        var now = +new Date();
        if (now - visitTime > 1000) { visitTime = now; } else {
            res.end('{status: error, message: "访问频率过快..."}');
            return;
        }
        // res.writeHead(200, );
        superagent.get(catchFirstUrl)
            .end(function(err, pres) {
                // 常规的错误处理
                if (err) {
                    console.log(err);
                }
                var $ = cheerio.load(pres.text),
                    $trs = $('.BOC_main.publish tr');
                $trs.each(function(i, tr) {
                    var dd = $(tr).find('td').eq(7).text();
                    if (dd) {
                        catchData.push(
                            '{ "time": "' + dd.replace(/(\d{4})\.(\d{2})\./g, '$1-$2-') + '", "value": ' + $(tr).find('td').eq(1).text() + '}'
                        );
                    }
                });
                res.end('[' + catchData.join() + ']');
            });
    })
    .get('/history', function(req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        });
        var now = +new Date();
        if (now - visitTime > 2000) { visitTime = now; } else {
            res.end('{status: error, message: "访问频率过快..."}');
            return;
        }
        var _data = [];
        db.exec('select * from hit t order by t.dd desc', [], function(err, rows) {
            if (!err) {
                for (var i = 0, len = rows.length; i < len; i++) {
                    _data.push('{"time":"' + rows[i].dd + '", "value": ' + rows[i].vv + '}');
                }
                res.end('[' + (_data.reverse()).join() + ']');
            } else {
                console.log('Error while performing Query.');
                res.end('{"status": "error", "message": "查询出错..."}');
            }
        });
    });

server.listen(3000);
