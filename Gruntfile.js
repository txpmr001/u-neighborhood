// our wrapper function (required by grunt and its plugins)
// all configuration goes inside this function
module.exports = function(grunt) {

  // CONFIGURE GRUNT
  grunt.initConfig({
    // get the configuration info from package.json file
    // this way we can use things like name and version (pkg.name)
    pkg: grunt.file.readJSON('package.json'),

    // all of our configuration goes here
    copy: {
      css: {
        files: [ 
          {cwd: 'src/css', src: '*.min.css', dest: 'dist/css', expand: true}
        ]
      },  
      js: {
        files: [ 
          {cwd: 'src/js', src: '*.min.js', dest: 'dist/js', expand: true}
        ]
      },
      images: {
        files: [ 
          {cwd: 'src/images', src: '**/*', dest: 'dist/images', expand: true}
        ]
      },
      other: {
        files: [ 
          {cwd: 'src', src: ['index.html', 'places.json', 'proxy.php', 'README.md'], dest: 'dist', expand: true}
        ]
      }
    },       

    uglify: {
      js: {
        files: {
          'dist/js/all.min.js': ['src/js/neighborhoodVM.js', 'src/js/neighborhood.js', 'src/js/formatInfo.js']
        }
      }
    },

    cssmin: {
      css: {
        files: {
          'dist/css/neighborhood.min.css': ['src/css/neighborhood.css']
        }
      }
    }
  });
  
   // Load the plugin that provides the "uglify" task
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-cssmin');
   grunt.loadNpmTasks('grunt-contrib-uglify');

   // Default task(s)
   grunt.registerTask('build', ['copy', 'uglify', 'cssmin']);
};
