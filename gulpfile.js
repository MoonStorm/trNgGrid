require('es6-promise').polyfill();

var gulp = require('gulp'),
    bump = require('gulp-bump'),
    ts = require('typescript'),
    gulpts = require('gulp-typescript'),
    es = require('event-stream'),
    merge = require('merge'),
    minifyjs = require('gulp-uglify'),
    concat = require('gulp-concat'),
    fs = require("fs"),
    rename = require("gulp-rename"),
    minifycss = require("gulp-cssnano"),
    argv = require('yargs').argv,
    insert = require("gulp-insert"),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    concatCss = require('gulp-concat-css'),
    less = require('gulp-less');


var paths = {
    sample: './sample',
    sampleFontsSource: './node_modules/bootstrap/fonts/*.*',
    sampleJsSource: './sample/sample.js',
    sampleCssSource: './sample/sample.less',
    sampleFontsOutput: './sample/fonts',
    sampleJsOutput: 'sample-bundle.js',
    sampleCssOutput: 'sample-bundle.css',
    src:'./src',
    tsSource: './src/typescript/**/*.ts',
    cssSource: './src/css/**/*.css',
    jsOutput: ".",
    cssOutput: "."
};

// tasks can be run from npm as well. example: npm run gulp -- ts-compile --version x.x.x
// the sample can be run and debugged with npm start, which by default will execute npm server.js
//    or alternatively via gulp build-sample or gulp debug-sample

gulp.task('ts-compile', function () {
    // set the version if provided via gulp: gulp ts-compile --version x.x.x
    var libVersion = argv.version;
    if (libVersion !== undefined) {
        gulp
            .src('./bower.json')
            .pipe(bump({ version: libVersion }))
            .pipe(gulp.dest('./'));

        gulp
            .src('./package.json')
            .pipe(bump({ version: libVersion }))
            .pipe(gulp.dest('./'));
    }

    // read several definitions
    eval("var npmProjectDef = " + fs.readFileSync("./package.json"));
    eval("var bowerProjectDef = " + fs.readFileSync("./bower.json"));
    var tsProject = gulpts.createProject('tsconfig.json', { typescript: ts});

    //bowerProjectDef.version = npmProjectDef.version;
    //fs.writeFileSync("./bower.json", JSON.stringify(bowerProjectDef, null, 4));

    //.match(/var\s+version\s*=\s*\"(\d+.\d+.\d+)\"/)
    var outputVersionInfo =
        "/*========================================================================*/\n" +
        "/*                    TrNgGrid version " + bowerProjectDef.version + "                              */\n" +
        "/*   -------------------------------------------------------------        */\n" +
        "/* THIS FILE WAS GENERATED VIA GULP. DO NOT MODIFY THIS FILE MANUALLY.    */\n" +
        "/*======================================================================= */\n";

    var outputJsResults = tsProject.src(paths.tsSource)
        .pipe(gulpts(tsProject))
        .pipe(concat('trNgGrid.js'))
        .pipe(insert.prepend(outputVersionInfo))
        .pipe(gulp.dest(paths.jsOutput));

    var minifiedJsResults = outputJsResults
        .pipe(insert.prepend(outputVersionInfo))
        .pipe(concat('trNgGrid.min.js'))
        .pipe(minifyjs())
        .pipe(gulp.dest(paths.jsOutput));

    var outputCssResults = gulp
        .src(paths.cssSource)
        .pipe(insert.prepend(outputVersionInfo))
        .pipe(concat('trNgGrid.css'))
        .pipe(gulp.dest(paths.cssOutput));

    var minifiedCssResults = gulp
        .src(paths.cssSource)
        .pipe(insert.prepend(outputVersionInfo))
        .pipe(concat('trNgGrid.min.css'))
        .pipe(minifycss())
        .pipe(gulp.dest(paths.cssOutput));

    return merge([outputJsResults, outputCssResults, minifiedJsResults, minifiedCssResults]);
});

gulp.task('build-sample', ['ts-compile'],
    function () {
        var browserifySampleResults = browserify(paths.sampleJsSource,
            {
                insertGlobals: true
            })
            .bundle()
            .pipe(source(paths.sampleJsOutput))
            .pipe(buffer())
            .pipe(gulp.dest(paths.sample));

        //var bootstrapCssCompileResults = gulp
        //    .src('./node_modules/bootstrap/less/bootstrap.less', { base: "./node_modules/bootstrap/less" })
        //    .pipe(less());

        //var cssConcatResults = es.merge(gulp.src(paths.cssOutput + '/trNgGrid.css'), bootstrapCssCompileResults)
        //    .pipe(concatCss('sample-bundle.css'))
        //    .pipe(gulp.dest(paths.sample));

        var copyFontsResults = gulp
            .src(paths.sampleFontsSource)
            .pipe(gulp.dest(paths.sampleFontsOutput));

        var cssConcatResults = gulp
            .src(paths.sampleCssSource)
            .pipe(less())
            .pipe(rename(paths.sampleCssOutput))
            .pipe(gulp.dest(paths.sample));

        return merge([browserifySampleResults, cssConcatResults, copyFontsResults]);
    });

gulp.task('debug-sample',
    ['ts-compile'],
    function () { 
        gulp.watch(paths.src, ['build-sample']);
    });

gulp.task('default',
    ['ts-compile'],
    function() {
    });