/**
 * 前缀树实现
 */
var Trie = function() {
  var _root = {
    value: ''
  }
  var insert = function(key) {
    var letters = key.split('')
      // 从根开始
    var node = _root
      // 遍历需要插入的字符串
    for (var index in letters) {
      var item = letters[index],
        obj = {
          value: item
        }
        // 当前节点存在
      if (!node.hasOwnProperty(item)) {
        obj.value = node.value + obj.value
        node[item] = obj
      }
      // 移动到下个节点
      node = node[item]
    }
  }

  // 查找指定前缀
  var find = function(key) {
    console.log("key = ", key)
    var letters = key.split('')
      // 从根开始
    var node = _root
      // 遍历需要插入的字符串
    for (var index in letters) {
      var item = letters[index]
        // 当前节点村存在
      if (!node.hasOwnProperty(item)) {
        // break;
        return []
      }
      // 移动到下个节点
      node = node[item]
    }
    // 匹配结束
    return toWords(node)
  }

  // 深度遍历找到叶子节点
  var toWords = function(node, result) {
      var keys = Object.keys(node),
        words = result || []
      if (node.value === '') {
        return words
      }
      for (var index in keys) {
        if (keys[index] !== 'value') {
          toWords(node[keys[index]], words)
        }
      }
      if (keys.length === 1) {
        words.push(node.value)
      }

      return words
    }
    /*
      var remove = function(key) {
        // 从根开始
        var node = _root
        var result = find(key)

        for (var index in result) {
          var item = Array.prototype.slice.call(result[index]).reverse().join('')
        }
      }

      var removeNode = function(node, key) {
        // 找到当前节点的所有子节点
        var keys = Object.keys(node)
        if(keys.indexOf(key) > -1){
          for(var index in keys){
            var item = node[keys[index]]
          }
        }
      }
    */
  return {
    i: insert,
    f: find,
    root: _root
  }

}()

 module.exports = Trie;

/*Trie.i("百度")
Trie.i("百德斯")
Trie.i("盛百味")

var result = Trie.f("百度")
console.log("1. 百度", result)
result = Trie.f("百")
console.log("2. 百", result)
result = Trie.f("3. google")
console.log("google", result)*/

