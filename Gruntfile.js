module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.js'
      }
    },

    copy: {
      main: {
        files: [
          // includes files within path
          {expand: true, cwd: 'src/', src: ['**'], dest: 'build/', filter: 'isFile'},
        ],
      },
    },

    less: {
      development: {
        options: {
          paths: ['assets/css']
        },
        files: {
          'build/master.css': 'src/master.less'
        }
      }
    },

    watch: {
      src: {
        files: ['src/**/*.*'],
        tasks: ['default'],
      }
    },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('build', ['copy','less']);
  grunt.registerTask('default', ['build','watch']);

};
