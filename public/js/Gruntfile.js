module.exports = function (grunt) {
  grunt.initConfig({
    browserify: {
      options: {
        browserifyOptions: {
          debug: true
        }
      },
      dist: {
        options: {
          transform: [
            ["babelify", { presets: ["es2015"] }]
          ]
        },
        files: {
          "./dist/spectrogram.js": ["./src/spectrogram.js"],
          "./dist/oscilloscope.js": ["./src/oscilloscope.js"],
          "./dist/frequency-graph.js": ["./src/frequency-graph.js"],
          "./dist/spectral-flux.js": ["./src/spectral-flux.js"],
        }
      }
    },
    watch: {
      scripts: {
        files: ["./src/*.js"],
        tasks: ["browserify"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["watch"]);
  grunt.registerTask("build", ["browserify"]);
};
