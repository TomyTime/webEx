var express = require('express')
var fs = require('fs')
var Trie = require('./Trie.js')
var pool = require('./db.js')

var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');
 
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(express.static('assets'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + "/" + "index.html");
})

app.get('/init', function (req, res) {
  handle_database(req, res)
})

app.post('/list', urlencodedParser, function(req, res){
  var brandNm = req.body.brandNm
  res.json({data: Trie.f(brandNm)});
})

var server = app.listen(8081, function (err) {
  if(err) console.log(err)
  console.log('start...')
})

/**
 * 查询品牌
 */
function handle_database(req, res) {

  pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    }

    console.log('connected as id ' + connection.threadId);

    connection.query("select * from AppDimBrand", function (err, rows) {
      connection.release();
      if (!err) {
        rows.map(function(value){
          Trie.i(value.brandNm)
        })
        // res.json(rows);
        res.json({"message": "初始化成功"})
      }
    });

    connection.on('error', function (err) {
      res.json({
        "code": 100,
        "status": "Error in connection database"
      });
      return;
    });
  });
}