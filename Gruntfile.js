module.exports = function(grunt) {

    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
    require('time-grunt')(grunt);

    // Default task.
//    grunt.registerTask('default', ['jshint', 'build', 'karma:unit']);
    grunt.registerTask('default', ['jshint', 'build']);
    grunt.registerTask('build', ['clean', 'html2js', 'concat', 'less:build', 'copy:assets']);
    grunt.registerTask('release', ['clean', 'html2js', 'uglify', 'jshint', /*'karma:unit',*/ 'concat:index', 'less:min', 'copy:assets']);
    grunt.registerTask('test-watch', ['karma:watch']);

    // Print a timestamp (useful for when watching)
    grunt.registerTask('timestamp', function() {
        grunt.log.subhead(Date());
    });

    var karmaConfig = function(configFile, customOptions) {
        var options = {
            configFile: configFile,
            keepalive: true
        };
        var travisOptions = process.env.TRAVIS && {
            browsers: ['Firefox'],
            reporters: 'dots'
        };
        return grunt.util._.extend(options, customOptions, travisOptions);
    };

    // Project configuration.
    grunt.initConfig({
        distdir: 'dist',
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' + ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' + ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */\n',
        src: {
            js: ['js/**/*.js'],
            jsTpl: ['<%= distdir %>/templates/**/*.js'],
            specs: ['test/**/*.spec.js'],
            scenarios: ['test/**/*.scenario.js'],
            html: ['index.html'],
            tpl: {
                app: ['js/app/**/*.tpl.html'],
                common: ['js/common/**/*.tpl.html']
            },
            less: ['less/main.less'], // recess:build doesn't accept ** in its file patterns
//            lessWatch: ['less/**/*.less']
        },
        clean: ['<%= distdir %>/*'],
        copy: {
            assets: {
                files: [{
                    dest: '<%= distdir %>',
                    src: '**',
                    expand: true,
                    cwd: 'assets/'
                }]
            }
        },
        karma: {
            unit: {
                options: karmaConfig('test/config/unit.js')
            },
            watch: {
                options: karmaConfig('test/config/unit.js', {
                    singleRun: false,
                    autoWatch: true
                })
            }
        },
        html2js: {
            app: {
                options: {
                    base: 'js/app'
                },
                src: ['<%= src.tpl.app %>'],
                dest: '<%= distdir %>/js/templates/app.js',
                module: 'templates.app'
            },
            common: {
                options: {
                    base: 'js/common'
                },
                src: ['<%= src.tpl.common %>'],
                dest: '<%= distdir %>/js/templates/common.js',
                module: 'templates.common'
            }
        },
        concat: {
            dist: {
                options: {
                    banner: "<%= banner %>"
                },
                src: ['<%= src.js %>', '<%= src.jsTpl %>'],
                dest: '<%= distdir %>/js/<%= pkg.name %>.js'
            },
            index: {
                src: ['index.html'],
                dest: '<%= distdir %>/index.html',
                options: {
                    process: true
                }
            },
            angular: {
                src: ['vendor/angular/angular.js', 'vendor/angular-route/angular-route.js', 'vendor/angular-resource/angular-resource.js', 'vendor/angular-sanitize/angular-sanitize.js'],
                dest: '<%= distdir %>/js/angular.js'
            },
            bootstrap: {
                src: ['vendor/angular-bootstrap/ui-bootstrap.js', 'vendor/angular-bootstrap/ui-bootstrap-tpls.js'],
                dest: '<%= distdir %>/js/bootstrap.js'
            },
            jquery: {
                src: ['vendor/jquery/dist/jquery.js'],
                dest: '<%= distdir %>/js/jquery.js'
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: "<%= banner %>"
                },
                src: ['<%= src.js %>', '<%= src.jsTpl %>'],
                dest: '<%= distdir %>/js/<%= pkg.name %>.js'
            },
            angular: {
                src: ['<%= concat.angular.src %>'],
                dest: '<%= distdir %>/js/angular.js'
            },
            bootstrap: {
                src: ['<%= concat.bootstrap.src %>'],
                dest: '<%= distdir %>/js/bootstrap.js'
            },
            jquery: {
                src: ['<%= concat.jquery.src %>'],
                dest: '<%= distdir %>/js/jquery.js'
            }
        },
        less: {
            build: {
                options: {
                    paths: ["assets/css"]
                },
                files: {
                    '<%= distdir %>/css/<%= pkg.name %>.css': ['<%= src.less %>']
                }
            },
            min: {
                options: {
                    paths: ["assets/css"],
                    cleancss: true
                },
                files: {
                    '<%= distdir %>/css/<%= pkg.name %>.css': ['<%= src.less %>']
                }
            }
        },
        watch: {
            all: {
                files: ['<%= src.js %>', '<%= src.specs %>', '<%= src.lessWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>'],
                tasks: ['default', 'timestamp']
            },
            build: {
                files: ['<%= src.js %>', '<%= src.specs %>', '<%= src.lessWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>'],
                tasks: ['build', 'timestamp']
            }
        },
        jshint: {
            files: ['gruntFile.js', '<%= src.js %>', '<%= src.jsTpl %>', '<%= src.specs %>', '<%= src.scenarios %>'],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                globals: {}
            }
        }
    });

};