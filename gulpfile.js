 /////////////////////////////////////
// REQUIRES
var addsrc       = require('gulp-add-src'),
    bower        = require('gulp-bower'),
    browserSync  = require('browser-sync').create(),
    cache        = require('gulp-cached'),
    clean        = require('gulp-clean'),
    concat       = require('gulp-concat'),
    data         = require('gulp-data'),
    favicons     = require('gulp-favicons'),
    fs           = require('fs'),
    gulp         = require('gulp'),
    gulpif       = require('gulp-if'),
    inquirer     = require('inquirer'),
    intercept    = require('gulp-intercept'),
    jade         = require('gulp-jade'),
    jadelint     = require('gulp-jadelint'),
    jeditor      = require("gulp-json-editor"),
    jSass        = require('gulp-json-sass'),
    minifycss    = require('gulp-minify-css'),
    ngConfig     = require('gulp-ng-config'),
    path         = require('path'),
    plumber      = require('gulp-plumber'),
    rename       = require('gulp-rename'),
    replace      = require('gulp-replace'),
    runSequence  = require('run-sequence'),
    sass         = require('gulp-sass'),
    sassLint     = require('gulp-sass-lint'),
    shell        = require('gulp-shell'),
    ts           = require('gulp-typescript'),
    tsd          = require('gulp-tsd'),
    tslint       = require('gulp-tslint'),
    uglify       = require('gulp-uglify');


 /////////////////////////////////////
// FUNCTIONS
function addController(controllerName) {
    gulp.src(tmplDir+'ts/controller.ts')
        .pipe(replace('@@{app}', appName))
        .pipe(replace('@@{name}', capFirstLetter(controllerName)))
        .pipe(rename(controllerName+'.ts'))
        .pipe(gulp.dest(jsSrcDir+'controller/'));
}

function addPage(pageName) {
    gulp.src(tmplDir+'jade/page.jade')
        .pipe(replace('@@{name}', pageName))
        .pipe(rename(pageName+'.jade'))
        .pipe(gulp.dest(htmlSrcDir+'page/'));
    gulp.src(tmplDir+'scss/page.scss')
        .pipe(replace('@@{name}', pageName))
        .pipe(rename(pageName+'.scss'))
        .pipe(gulp.dest(cssSrcDir+'page/'));
    addController(pageName);
    addRoute(pageName, '/'+pageName, 'html/page/'+pageName+'.html', capFirstLetter(pageName)+'Controller');
}

function removePage(state) {
    var newRoutes = appRoutes;
    for(var i=0; i < newRoutes.length; i++){
        var route = newRoutes[i];
        if(route.state === state){
            newRoutes.splice(i,1);
            gulp.src(configFile)
                .pipe(jeditor(function(json) {
                    json.routes = newRoutes;
                    return json; 
                }))
                .pipe(gulp.dest("./"));
        }
    }

    gulp.src([
            cssSrcDir+'page/'+state+'.scss',
            htmlSrcDir+'page/'+state+'.jade',
            htmlDir+'page/'+state+'.html',
            jsSrcDir+'controller/'+state+'.ts'
        ],{
            read: false
        })
        .pipe(clean({force: true}));
    
    setTimeout(function(){
        runSequence('router', 'js-build', 'sync-reload');
    }, 2000)
}

function addRoute(state, url, template, controller){
    var newRoutes = appRoutes;
    newRoutes.push({
        state: state,
        url: url,
        templateUrl: template,
        controller: appName + '.' + controller + ' as ctrl'
    });
    gulp.src(configFile)
        .pipe(jeditor({
            'routes': newRoutes
        }))
        .pipe(gulp.dest("./"));
    setTimeout(function(){
        runSequence('router', 'js-build', 'sync-reload');
    }, 2000);
}

function capFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function checkString(string) {
    return /^[a-z]+$/i.test(string);
}

function cleanString(string) {
    return string.replace(/[^A-Za-z0-9]/g, '');
}

function removeSpaces(string) {
    return string.replace(/\s+/g, '');
}

function onError(err) {
  global.isError = true;
  console.log(err);
  browserSync.notify(err.message);
  this.emit('end');
}

function setVars() {  
    configFile   = 'enjin.json';
    configJSON   = JSON.parse(fs.readFileSync(configFile));
    // APP
    appName      = configJSON.name;
    appDebug     = configJSON.debug;
    appDesc      = configJSON.description;
    appDir       = configJSON.root;
    appIcon      = configJSON.img.favicon;
    appLocal     = configJSON.local;
    appMobile    = configJSON.mobile;
    appRoutes    = configJSON.routes;
    appUrl       = configJSON.url;
    appVersion   = configJSON.version;
    appAuthor    = configJSON.author;
    appBuild     = 'build/';
    appPlugins   = configJSON.plugins;
    // CSS
    cssSrcDir    = configJSON.css.srcDir;
    cssDestDir   = appDir+configJSON.css.dir;
    cssDestFile  = configJSON.css.file;
    cssBuild     = configJSON.css.build;
    cssBuildDir  = appBuild+"css/";
    cssBuildLib  = 'library.scss';
    cssLib       = configJSON.css.libraries;
    cssLint      = 'scss-lint.yml';
    cssWatch     = configJSON.css.watch;
    // ERROR
    errorCount   = 0;
    errorTimeout = 10000;
    // FONT
    fontDir      = appDir+configJSON.font.dir;
    fontWatch    = configJSON.font.watch;
    // HTML
    htmlDir      = appDir+configJSON.html.dir;
    htmlFile     = configJSON.html.file;
    htmlSrcDir   = configJSON.html.srcDir;
    htmlSrcFile  = configJSON.html.srcFile;
    htmlWatch    = configJSON.html.watch;
    // IMG
    iconDir      = 'icon/';
    imgDir       = appDir+configJSON.img.dir;
    imgIconDir   = imgDir+iconDir;
    imgWatch     = configJSON.img.watch;
    // JS
    jsSrcDir     = configJSON.js.srcDir;
    jsDestDir    = appDir+configJSON.js.dir;
    jsDestFile   = configJSON.js.file;
    jsBuild      = configJSON.js.build;
    jsBuildDir   = appBuild+"js/";
    jsBuildLib   = 'library.js';
    jsLib        = configJSON.js.libraries;
    jsWatch      = configJSON.js.watch;
    // TEMPLATES
    tmplDir      = configJSON.templates;
}


 /////////////////////////////////////
// ON LOAD
setVars();
global.isWatching = false;
global.synced     = false;
global.isError    = false;


 /////////////////////////////////////
// TASKS
gulp.task('add-controller', function(done){
    inquirer.prompt([{
        type: 'input',
        message: 'What is the name of the controller?',
        name: 'controller'
    }], function(res) {
        addController(res.controller);
        done();
    });
});

gulp.task('add-page', function(done){
    inquirer.prompt([{
        type: 'input',
        message: 'What is the name of the page?',
        name: 'page'
    }], function(res) {
        addPage(res.page);
        done();
    });
});

gulp.task('add-route', function(done){
    inquirer.prompt([{
        type: 'input',
        message: 'What is the state name?',
        name: 'state'
    },{
        type: 'input',
        message: 'What is the url? ( Beginning with "/" )',
        name: 'url'
    },{
        type: 'input',
        message: 'What is the path to the template?',
        name: 'template'
    },{
        type: 'input',
        message: 'What is the name of the controller?',
        name: 'controller'
    }], function(res) {
        addRoute(res.state, res.url, res.template, res.controller);
        done();
    });
});

gulp.task('android', function(callback){
    runSequence('config', 'build', 'build-android', callback);
});

gulp.task('bower-install', function(){
    return bower({ cmd: 'install'});
});

gulp.task('bower-update', function(){
    return bower({ cmd: 'update'});
});

gulp.task('build', function(callback){
    return runSequence(
        'clean', 
        'config', 
        'html-build', 
        'css-build', 
        'js-build', 
        //'minify',
        callback
    );
});

gulp.task('build-android', shell.task(['ionic run android']))

gulp.task('clean', function(){
    return gulp.src(appBuild, {read: false})
    .pipe(clean({force: true}));
});

gulp.task('clean-install', function(){
    return gulp.src(['.floo', '.flooignore', '.git/'], {read: false})
    .pipe(clean({force: true}));
});

gulp.task('config', function(callback){
    runSequence(
        'config-bower', 
        'js-app',  
        'config-js', 
        'config-css', 
        'config-ionic', 
        'config-node', 
        'config-sublime',
        callback
    );
});

gulp.task('config-bower', function(){
    return gulp.src('./bower.json')
        .pipe(jeditor(function(json) {
            json.name = cleanString(appName);
            return json; 
        }))
        .pipe(gulp.dest("./"));
});

gulp.task('config-build', function(){
    return runSequence(
        'set-vars', 
        'config',
        'router',
        'html-build', 
        'js-build', 
        'css-build'
    );
});

gulp.task('config-cordova', function(){
    return gulp.src(tmplDir+'config/config.xml')
        .pipe(replace('@@{name}', cleanString(appName).toLowerCase()))
        .pipe(replace('@@{title}', appName))
        .pipe(replace('@@{version}', appVersion))
        .pipe(replace('@@{description}', appDesc))
        .pipe(replace('@@{author}', appAuthor.name))
        .pipe(replace('@@{email}', appAuthor.email))
        .pipe(replace('@@{url}', appAuthor.url))
        .pipe(gulp.dest("./"));
});

gulp.task('config-css', function(){
    return gulp.src(configFile)
        .pipe(intercept(function(file) {
            var json = JSON.parse(file.contents.toString());
            file.contents = new Buffer(JSON.stringify(json.css.vars));
            return file;
        }))
        .pipe(jSass({
          sass: false
        }))
        .pipe(rename('_variables.scss'))
        .pipe(gulp.dest(cssSrcDir));
});

gulp.task('config-ionic', function(){
    return gulp.src('ionic.project')
        .pipe(jeditor(function(json) {
            json.name = cleanString(appName);
            return json; 
        }))
        .pipe(gulp.dest("./"));
});

gulp.task('config-js', function(){
    return gulp.src(configFile)
        .pipe(jeditor(function(json) {
            json = {'enjin': json};
            return json;
        }))
        .pipe(ngConfig(appName+'.config'))
        .pipe(rename('config.js'))
        .pipe(gulp.dest(jsBuildDir));
});

gulp.task('config-node', function(){
    return gulp.src('package.json')
        .pipe(jeditor(function(json) {
            json.name = cleanString(appName).toLowerCase();
            json.description = appDesc;
            json.version = appVersion;
            return json; 
        }))
        .pipe(gulp.dest("./"));
});

gulp.task('config-sublime', function(){
    return gulp.src(tmplDir+'config/sublime.json')
        .pipe(gulpif(!appDebug, jeditor(function(json) {
            json.folders[0].folder_exclude_patterns = json.folders[0].folder_exclude_patterns.concat(['build', 'templates', 'node_modules', 'www']);
            return json; 
        })))
        .pipe(rename(appName+'.sublime-project'))
        .pipe(gulp.dest('./'));
});

gulp.task('config-vars', setVars);

gulp.task('css-build', function(){
    return runSequence(
        'config-css', 
        'css-import', 
        'css-lib', 
        'css-lint', 
        'css-compile', 
        'css-concat'
    );
});

gulp.task('css-compile', function(){
    return gulp.src(cssWatch)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                browserSync.notify(error.message, errorTimeout);
                this.emit('end');
            }
        }))
        .pipe(sass())
        .pipe(gulp.dest(cssBuildDir));
});

gulp.task('css-concat', function(){
    return gulp.src(cssBuild)
        .pipe(concat(cssDestFile))
        .pipe(gulp.dest(cssDestDir))
        .pipe(gulpif(global.isWatching, browserSync.stream()));
});

gulp.task('css-lint', function(){
    var errorCount   = 0,
        errorMessage = [];
        global.isError = false;
    return gulp.src(cssWatch)
        .pipe(cache('css-lint'))
        .pipe(sassLint())
        .on('error', onError)
        .pipe(sassLint.format())
        .on('end', function(){
            if(!global.isError){
                runSequence('css-compile', 'css-concat');    
            }
        });
});

gulp.task('css-minify', function(){
    return gulp.src(cssDestDir+cssDestFile)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest(cssDestDir));
});

gulp.task('css-import', function() {
    var imports = "";
    for(var i=0; i < configJSON.css.libraries.length; i++){
        var cssLib = configJSON.css.libraries[i];
        imports += '@import "../../'+cssLib+'";\n';
    }

    return gulp.src(tmplDir+'scss/libraries.scss')
        .pipe(replace('@@{libraries}', imports))
        .pipe(gulp.dest(cssSrcDir));
});

gulp.task('css-lib', function() {
    return gulp.src(cssSrcDir+'libraries.scss')
        .pipe(sass())
        .pipe(gulp.dest(cssBuildDir));
});

gulp.task('icon', function(){
    runSequence('favicon', 'icon-copy', 'html-template'); 
});

gulp.task('icon-copy', function(){
    return gulp.src(appIcon)
        .pipe(gulp.dest(imgDir));
});

gulp.task('install', function(done){
    inquirer.prompt([{
        type: 'input',
        message: 'What is the name of your new app?',
        default: 'MadnessEnjin',
        name: 'name'
    },{
        type: 'input',
        message: 'How would you describe your new app?',
        default: 'An application stack for front-end design by Madness Labs',
        name: 'description'
    },{
        type: 'input',
        message: 'What is the url of your app?',
        default: 'http://MadnessEnjin.net',
        name: 'url'
    },{
        type: 'input',
        message: 'Who is the author of this app?',
        default: 'Madness Labs',
        name: 'author'
    },{
        type: 'input',
        message: 'What is the author\'s website url?',
        default: 'http://MadnessLabs.net',
        name: 'authorUrl'
    },{
        type: 'input',
        message: 'What is the author\'s email?',
        default: 'info@MadnessLabs.net',
        name: 'authorEmail'
    }], function(res) {
        gulp.src('./enjin.json')
            .pipe(jeditor(function(json) {
                json.name = cleanString(res.name);
                json.author.name = res.author;
                json.author.url = res.authorUrl;
                json.author.email = res.authorEmail;
                json.url = res.url;
                json.description = res.description;
                return json; 
            }))
            .pipe(gulp.dest("./"))
            .on('end', function(){
                setVars();

                addController('home');
                addController('settings');

                runSequence(
                    'clean',
                    'clean-install',
                    'config-bower',
                    'js-app',  
                    'config-js', 
                    'config-css', 
                    'config-cordova', 
                    'config-ionic', 
                    'config-node', 
                    'config-sublime',
                    'bower-install',
                    'tsd',
                    'fonts',
                    //'favicon',
                    'icon-copy', 
                    'router',
                    'html-lint',
                    'html-template',
                    'html-build', 
                    'css-import', 
                    'css-lib', 
                    'css-lint', 
                    'css-compile', 
                    'css-concat', 
                    'js-lint', 
                    'js-compile', 
                    'js-concat', 
                    'sync', 
                    'watch'
                );

                done();
            });
    });
});

gulp.task('reinstall', function(callback){
    runSequence(
        'clean',
        'config-bower',
        'js-app',  
        'config-js', 
        'config-css', 
        'config-cordova', 
        'config-ionic', 
        'config-node', 
        'config-sublime',
        'bower-install',
        'tsd',
        'fonts',
        //'favicon',
        'icon-copy', 
        'router',
        'html-lint',
        'html-template',
        'html-build', 
        'css-import', 
        'css-lib', 
        'css-lint', 
        'css-compile', 
        'css-concat', 
        'js-lint', 
        'js-compile', 
        'js-concat', 
        'sync', 
        'watch',
        callback
    );
});

gulp.task('favicon', function(){
    gulp.src(htmlSrcDir+'favicon.jade', {read: false})
        .pipe(clean());
    gulp.src(appIcon).pipe(favicons({
        appName: appName,
        appDescription: appDesc,
        background: "#fff",
        url: appUrl,
        path: '/img/icon/',
        version: appVersion,
        logging: true,
        html: htmlSrcDir+'favicon.jade'
    }))
    .pipe(gulp.dest(imgIconDir));
    /*return gulp.src(htmlSrcDir+'favicon.jade')
        .pipe(favicons({
            files: {
                src: appIcon,                
                dest: '../../'+imgIconDir,
                iconsPath: 'img/icon'
            },
            settings:{
                appName: appName,
                appDescription: appDesc,
                background: "#{css.vars.theme.primary}",
                url: appUrl,
                version: appVersion,
                logging: true
            }
        }))
        .pipe(gulp.dest(htmlSrcDir));*/
});

gulp.task('html-compile', function () {
    var errored = false;
    var errorMessage = [];
    var ext = htmlSrcFile.split('.').pop();
    return gulp.src(htmlWatch)
        .pipe(plumber({
            errorHandler: function(error) {
                errored = true;
                if(global.isWatching && global.synced){
                    errorMessage.push(error.message.replace(/(?:\r\n|\r|\n)/g, '<br />'));
                }
                this.emit('end');
            }
        }))
        .pipe(cache('html-compile'))
        .pipe(jade({
            locals: configJSON,
            pretty: true
        }))
        .pipe(rename(function(file){
            if(file.basename+'.'+ext === htmlSrcFile){
                file.basename = 'index';
                file.dirname = '../';
            }
        }))
        .pipe(gulp.dest(htmlDir))
        .on('end', function(){
            if(!errored && global.isWatching && global.synced){
                runSequence('sync-reload');
            }else if(errored && global.isWatching && global.synced){
                cache.caches = {};
                browserSync.notify("<div style='text-align:left;'>"+errorMessage.join("<hr />")+"</div>", errorTimeout);
            }
        });
});

gulp.task('html-build', function(){
    var ext = htmlSrcFile.split('.').pop();
    return gulp.src(htmlWatch)
        .pipe(gulpif(global.isWatching, plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        })))
        .pipe(jade({
            locals: configJSON,
            pretty: true
        }))        
        .pipe(rename(function(file){
            if(file.basename+'.'+ext === htmlSrcFile){
                file.basename = 'index';
                file.dirname = '../';
            }
        }))
        .pipe(gulp.dest(htmlDir));
});

gulp.task('html-lint', function(){
    var lintWatch = htmlWatch;
    lintWatch.pop();
    var errorCount = 0;
    var errorMessage = [];
    return gulp.src(lintWatch)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(jadelint())
        .pipe(intercept(function(file) {
            if(file.jadelint.errors.length > 0){
                errorCount = errorCount + file.jadelint.errors.length;
                errorMessage.concat(file.jadelint.errors);
                console.log(errorMessage);
            }
            return file;
        }))
        .on('end', function(){
            if(errorCount === 0 && global.isWatching && global.synced){
                runSequence('html-compile');
            }else if(errorCount > 0 && global.isWatching && global.synced){
                browserSync.notify(errorMessage.join("<br />"), errorTimeout);
            }
        });
});

gulp.task('html-template', function(){
    return gulp.src(htmlSrcDir+htmlSrcFile)
        .pipe(jade({
            locals: configJSON,
            pretty: true
        }))        
        .pipe(rename('index.html'))
        .pipe(gulp.dest(appDir))
        .on('end', function(){
            if(global.isWatching){
                browserSync.reload();
            }
        });
        //.pipe(gulpif(global.isWatching, browserSync.reload()));
});

gulp.task('js-app', function(){
    return gulp.src(tmplDir+'ts/app.ts')
        .pipe(replace('@@{app}', appName))
        .pipe(replace('@@{plugins}', JSON.stringify(appPlugins).slice(1,-1).replace(/"/g, "'").replace(/,/g, ", \n\t\t")))
        .pipe(gulp.dest(jsSrcDir));
});

gulp.task('js-build', function(){
    return runSequence(
        'config-js', 
        'js-lint', 
        'js-compile', 
        'js-concat'
    );
});

gulp.task('js-compile', function () {
    var tsResult = gulp.src(jsWatch)
        .pipe(gulpif(global.isWatching, plumber({
            errorHandler: function(error) {
                browserSync.notify(error.message, errorTimeout);
                this.emit('end');
            }
        })))
        .pipe(gulpif(global.isWatching,  cache('js-compile')))
        .pipe(addsrc('src/tsd/**/*.d.ts'))
        .pipe(ts({
            "compilerOptions": {
                "target": "es5",
                "sourceMap": false
            }
        }));

        tsResult.dts.pipe(gulp.dest('build/js'));
        return tsResult.js.pipe(gulp.dest('build/js'));
});

gulp.task('js-concat', function(){
    var concatArr = jsLib.concat(jsBuild);
    return gulp.src(concatArr)
        .pipe(concat(jsDestFile))
        .pipe(gulp.dest(jsDestDir));
});

gulp.task('js-lib', function(){
    if(global.synced){
        runSequence('js-concat', 'sync-reload');
    }
});

gulp.task('js-lint', function(){
    var errorCount = 0;
    return gulp.src(jsWatch)
        .pipe(gulpif(global.isWatching, plumber({
            errorHandler: function(error) {
                cache.caches = {};
                browserSync.notify(error.message, errorTimeout);
                this.emit('end');
            }
        })))
        .pipe(gulpif(global.isWatching,  cache('js-lint')))
        .pipe(tslint())
        .pipe(tslint.report('prose'))
        .pipe(intercept(function(file) {
            errorCount = errorCount + file.tslint.failureCount;
            //console.log(file.tslint);
            return file;
        }))
        .on('end', function(){
            console.log(errorCount);
            if(errorCount === 0 && global.isWatching && global.synced){
                runSequence('js-compile', 'js-concat', 'sync-reload');
            }
        });
});

gulp.task('js-minify', function(){
    return gulp.src(jsDestDir+jsDestFile)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest(jsDestDir));
});

gulp.task('fonts', function(){
    return gulp.src(fontWatch)
        .pipe(gulp.dest(fontDir));
});

gulp.task('lint', function(){
    runSequence(
        'html-lint', 
        'css-lint', 
        'js-lint'
    );
});

gulp.task('minify', function(){
    runSequence(
        'css-minify', 
        'js-minify'
    );
});

gulp.task('remove-page', function(done){
    inquirer.prompt([{
        type: 'input',
        message: 'What is the state name of the page you would like to remove?',
        name: 'state'
    }], function(res) {
        removePage(res.state);
        done();
    });
});

gulp.task('router', function(){
    var routes = [];
    var defaultRoute = false;

    for(var i=0; i < appRoutes.length; i++){
        var route = appRoutes[i];
        var stateName = route.state;
        delete route.state;
        if(!defaultRoute){
            defaultRoute = stateName;
        }
        routes.push(".state('"+stateName+"', "+ JSON.stringify(route).replace(/"/g, "'").replace(/,/g, ", \n") +")");
    }

    return gulp.src(tmplDir+'ts/router.ts')
        .pipe(replace('@@{app}', appName))
        .pipe(replace('@@{routes}', routes.join("\n\t\t\t\t")))
        .pipe(replace('@@{default}', defaultRoute))
        .pipe(gulp.dest(jsSrcDir));    
});

gulp.task('set-vars', setVars);

gulp.task('sync', function(){
    browserSync.init({
        port: 3000,
        files: ['index.html', '**/*.js'],
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'silent',
        logPrefix: appName,
        notify: true,
        reloadDelay: 0,
        server: {
            baseDir: appDir
        }
    });
    global.synced = true;
});

gulp.task('sync-reload', function(){
    browserSync.reload();
});

gulp.task('tsd', function (callback) {
    tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
});

gulp.task('watch', function(){
    global.isWatching = true;
    gulp.watch(configFile, ['config-build']);
    gulp.watch(cssWatch, function(){
        runSequence(['css-compile', 'css-concat'])
    });
    gulp.watch(jsWatch, ['js-lint']);
    gulp.watch(jsLib, ['js-lib']);
    gulp.watch(htmlWatch, ['html-compile']);
    //gulp.watch(imgWatch, ['icon']);
});

gulp.task('default', function(callback){
    return runSequence(
        'clean',
        'router',
        'config',
        'html-lint',
        'html-build', 
        'css-import', 
        'css-lib', 
        'css-lint', 
        'css-compile', 
        'css-concat', 
        'js-lint', 
        'js-compile', 
        'js-concat', 
        'sync', 
        'watch',
        callback
    );
});