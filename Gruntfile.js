module.exports = function(grunt) {

  // 项目配置
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
        css: {
            files: [
                'public/stylesheets/style.css'
            ],
            tasks: ['cssmin:minify']
        }
    },

      browserSync: {
      files: {
        src : [
          'public/stylesheets/*.css',
          'public/images/*',
          'public/javascripts/*.js',
          'view/*'
        ]
      },
      options: {
        watchTask: true
      }
    },
    cssmin: {
      minify: {
        expand: true,
        cwd: 'public/stylesheets/',
        src: ['*.css', '!*.min.css'],
        dest: 'public/stylesheets/',
        ext: '.min.css'
      }/*,
      combine: {
        files: {
          'css/out.min.css': ['pub/part1.min.css', 'css/part2.min.css']
        }
      }*/
    }
  });

    // 加载Grunt插件
  grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

  // 注册grunt默认任务
  grunt.registerTask('default', ["browserSync", "watch"]);
};