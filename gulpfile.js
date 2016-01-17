/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

require('es6-promise').polyfill();

var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    merge = require('merge'),
    minifyjs = require('gulp-uglify'),
    concat = require('gulp-concat'),
    fs = require("fs"),
    rename = require("gulp-rename"),
    minifycss = require("gulp-cssnano"),
    insert = require("gulp-insert");


var paths = {
    //npm: './node_modules/',
    //lib: "./" + mainProjectDef.webroot + "/lib/",
    tsSource: './typescript/**/*.ts',
    cssSource: './css/**/*.css',
    jsOutput: ".",
    cssOutput: ".",
    tsDef: "./typescript/definitions/",
    localSampleWebSite:"./wwwroot/"
};

gulp.task('ts-compile', function () {
    eval("var mainProjectDef = " + fs.readFileSync("./project.json"));
    eval("var tsProjectDef = " + fs.readFileSync("./tsconfig.json"));
    eval("var npmProjectDef = " + fs.readFileSync("./package.json"));
    eval("var bowerProjectDef = " + fs.readFileSync("./bower.json"));

    //var tsProject = ts.createProject();
    //console.log(tsProject.options);
    bowerProjectDef.version = npmProjectDef.version;
    fs.writeFileSync("./bower.json", JSON.stringify(bowerProjectDef, null, 4));

    //.match(/var\s+version\s*=\s*\"(\d+.\d+.\d+)\"/)
    var outputVersionInfo =
        "/*========================================================================*/\r\n" +
        "/*                    TrNgGrid version " + npmProjectDef.version + "                              */\r\n" +
        "/*   -------------------------------------------------------------        */\r\n" +
        "/* THIS FILE WAS GENERATED VIA GULP. DO NOT MODIFY THIS FILE MANUALLY.    */\r\n" +
        "/*======================================================================= */\r\n";

    //var tsResult = gulp
    //    .src(paths.tsSource)
    //    .pipe(ts(tsProject));

    //var outputDtsResults = tsResult.dts
    //    .pipe(gulp.dest(paths.tsDef));

    //var outputJsResults = tsResult.js
    //    .pipe(insert.prepend(outputVersionInfo))
    var outputJsResults = gulp
        .src(paths.tsSource)
        .pipe(ts(tsProjectDef.compilerOptions))
        .pipe(concat('trNgGrid.js'))
        .pipe(insert.prepend(outputVersionInfo))
        .pipe(gulp.dest(paths.jsOutput))
        .pipe(gulp.dest(paths.localSampleWebSite));

    //var minifiedJsResults = tsResult.js
    var minifiedJsResults = outputJsResults
        .pipe(insert.prepend(outputVersionInfo))
        .pipe(concat('trNgGrid.min.js'))
        .pipe(minifyjs())
        .pipe(gulp.dest(paths.jsOutput));

    var outputCssResults = gulp
        .src(paths.cssSource)
        .pipe(insert.prepend(outputVersionInfo))
        .pipe(concat('trNgGrid.css'))
        .pipe(gulp.dest(paths.cssOutput))
        .pipe(gulp.dest(paths.localSampleWebSite));

    var minifiedCssResults = gulp
        .src(paths.cssSource)
        .pipe(insert.prepend(outputVersionInfo))
        .pipe(concat('trNgGrid.min.css'))
        .pipe(minifycss())
        .pipe(gulp.dest(paths.cssOutput));

    return merge([/*outputDtsResults,*/ outputJsResults, outputCssResults, minifiedJsResults, minifiedCssResults]);

    //return merge([
    //    tsResult.dts.pipe(gulp.dest(paths.tsDef)),
    //    tsResult.js.pipe(gulp.dest(paths.tsOutput))
    //]);
});

gulp.task('watch', ['ts-compile'], function () {
    gulp.watch(paths.tsSource, ['ts-compile']);
});

gulp.task('default', ['ts-compile'], function () {
    // place code for your default task here
});