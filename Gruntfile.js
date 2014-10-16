module.exports = function(grunt) {
	var cssMap = {
			'dist/ui.css': [
				'css/*'
			]
		},

		jsMap = {
			'dist/ui.js': [
				'js/ui.js',
				'js/modules/**/*.js',
				'js/helpers/*.js',
				'js/utils/*.js'
			],
			'dist/main.js': [
				'js/app.js'
			]
		},

		watchedCssFiles = (function() {
			var ar = [];

			for (var item in cssMap) {
				if (cssMap.hasOwnProperty(item)) {
					ar = ar.concat(cssMap[item]);
				}
			}

			return ar;
		})(),

		watchedJsFiles = (function() {
			var ar = [];

			for (var item in jsMap) {
				if (jsMap.hasOwnProperty(item)) {
					ar = ar.concat(jsMap[item]);
				}
			}

			return ar;
		})();


	// Задачи
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*!\n' +
			' * Main Angular.Banki.UI v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
			' * Copyright 2004-<%= grunt.template.today("yyyy") %>.\n' +
			' */\n',

		/* todo
		stylus: {
			// Компиляция Stylus в CSS
		},

		less: {
			// Компиляция Less в CSS
		},
		*/

		concat: {
			options: {
				separator: '\n\n\n'
				// sourceMap: true
			},

			// Склеивание css-файлов
			css: {
				files: cssMap
			},

			// Склеивание js-файлов
			js: {
				files: jsMap
			}
		},

		watch: {
			/*
			// Перекомпиляция стилей при изменении styl-файлов
			stylus: {
				files: ['*.styl'],
				tasks: 'stylus'
			},

			// Перекомпиляция стилей при изменении less-файлов
			less: {
				files: ['*.less'],
				tasks: 'less'
			},
			*/

			js: {
				files: watchedJsFiles,
				tasks: ['concat:js' /*, 'jshint'*/ ]
			},

			css: {
				files: watchedCssFiles,
				tasks: ['concat:css']
			}
		},

		uglify: {
			options: {

			},
			dist: {
				files: {
					'dist/<%= pkg.name %>.min.js': ['dist/*.js']
				}
			}
		},

		jshint: {
			files: ['Gruntfile.js', '<%= pkg.name %>.js'],
			options: {
				// options here to override JSHint defaults
				globals: {
					jQuery: true,
					console: true,
					module: true,
					document: true
				}
			}
		},

		autoprefixer: {
			options: {
				browsers: [
					'Android 2.3',
					'Android >= 4',
					'Chrome >= 20',
					'Firefox >= 24', // Firefox 24 is the latest ESR
					'Explorer >= 8',
					'iOS >= 6',
					'Opera >= 12',
					'Safari >= 6'
				]
			},
			core: {
				options: {
					map: true
				},
				src: 'dist/ui.css'
			}
		},

		cssmin: {
			options: {
				keepSpecialComments: 0
			},
			minify: {
				expand: true,
				src: ['*.css', '!*.min.css'],
				ext: '.min.css'
			}
		},

		usebanner: {
			options: {
				position: 'top',
				banner: '<%= banner %>'
			},
			files: {
				src: ['<%= pkg.name %>.min.css', '<%= pkg.name %>.min.js']
			}
		},

		docco: {
			debug: {
				src: ['common/ui-elements/**/*.js'],
				options: {
					output: 'docs/'
				}
			}
		}
	});

	// These plugins provide necessary tasks.
	require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
	require('time-grunt')(grunt);

	// Documentation task.
	grunt.registerTask('jsdoc', ['docco']);

	grunt.registerTask('dev', ['concat', 'watch']);
	grunt.registerTask('prod', ['concat', 'autoprefixer', 'uglify', 'cssmin', 'usebanner']);
};