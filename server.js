var http = require("http"),
    url = require("url"),
    superagent = require("superagent"),
    phantom = require('phantom'),
    async = require("async"),
    cheerio = require("cheerio"),
    eventproxy = require('eventproxy'),
    dateFormat = require('dateformat');

var ep = new eventproxy();

var startDate = new Date(), //开始时间
    endDate = new Date(startDate.getTime() - 1000 * 60 * 60 * 24 * 0), //结束时间 
    catchFirstUrl = 'http://srh.bankofchina.com/search/whpj/search.jsp?nothing=' + dateFormat(endDate, 'yyyy-mm-dd') + '&erectDate=' + dateFormat(startDate, 'yyyy-mm-dd') + '&pjname=1330', //入口页面
    deleteRepeat = {}, //去重哈希数组
    urlsArray = [], //存放爬取网址
    catchData = [], //存放爬取数据
    pageUrls = [], //存放收集文章页面网站
    pageNum = 200; //要爬取文章的页数

/*for(var dd = startDate; dd > endDate ; dd-=1000*60*60*24){
    pageUrls.push('http://srh.bankofchina.com/search/whpj/search.jsp?erectDate='+dateFormat(dd, 'yyyy-mm-dd')+'&nothing='+dateFormat(dd, 'yyyy-mm-dd')+'&pjname=1330');
}*/

// 抓取当前分页信息
function pageInfo(url) {
    var infoArray = {};
    superagent.get(url)
        .end(function(err, ares) {
            if (err) {
                console.log(err);
                return;
            }
            var $ = cheerio.load(ares.text),
                _total = $('#list_navigator li:first');
            console.log(_total);
            /*var $ = cheerio.load(ares.text),
                info = $('#profile_block a'),
        len = info.length,
        age = "",
        flag = false,
        curDate = new Date();

      // 小概率异常抛错    
      try{
        age = "20"+(info.eq(1).attr('title').split('20')[1]);
      }
      catch(err){
        console.log(err);
        age = "2012-11-06";
      } 

        infoArray.name = info.eq(0).text();
        infoArray.age = parseInt((new Date() - new Date(age))/1000/60/60/24);
        
        if(len == 4){
            infoArray.fans = info.eq(2).text();
            infoArray.focus = info.eq(3).text();    
        }else if(len == 5){// 博客园推荐博客
            infoArray.fans = info.eq(3).text();
            infoArray.focus = info.eq(4).text();    
        }
        //console.log('用户信息:'+JSON.stringify(infoArray));
        catchData.push(infoArray);*/
        });
}

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
    function onRequest(req, res) {
        // 设置字符编码(去掉中文会乱码)
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        // 当所有 'BlogArticleHtml' 事件完成后的回调触发下面事件
        /*        ep.after('BlogArticleHtml', pageUrls.length * 20, function(articleUrls) {
                    console.log('BlogArticleHtml');
                    // 获取 BlogPageUrl 页面内所有文章链接
                    for (var i = 0; i < articleUrls.length; i++) {
                        res.write(articleUrls[i] + '<br/>');
                    }
                    console.log('articleUrls.length is' + articleUrls.length + ',content is :' + articleUrls);

                    //控制并发数
                    

                });*/
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
                                                catchData.push({
                                                    date: $(tr).find('td').eq(7).text(),
                                                    value: $(tr).find('td').eq(1).text()
                                                });
                                            }
                                        });
                                    });
                                console.log('-----');
                                setTimeout(function() {
                                    curCount--;
                                    callback(null, url + 'Call back content');
                                }, delay);
                            };

                            // 使用async控制异步抓取    
                            // mapLimit(arr, limit, iterator, [callback]);
                            // 异步回调
                            async.mapLimit(pageUrls, 5, function(url, callback) {
                                console.log('mapLimit()');
                                reptileMove(url, callback);
                            }, function(err, result) {
                                console.log(catchData);
                            });

                            // ep.emit('BlogArticleHtml', pageUrls);
                            // pageUrls.forEach(function(pageUrl) {

                            // });

                            // 轮询 所有文章列表页
                            /*        pageUrls.forEach(function(pageUrl) {
                                        
                                    })*/

                        })
                    })
            });
        });
    }

    http.createServer(onRequest).listen(3000);
}

exports.start = start;
