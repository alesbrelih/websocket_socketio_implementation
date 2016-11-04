///////////////////////////////////////////////////
// ------ gulp modules which will be used ---------
///////////////////////////////////////////////////
const gulp = require("gulp"); //gulp
const concat = require("gulp-concat"); //concat files
const uglify = require("gulp-uglify"); //uglify scripts
const sass = require("gulp-sass");  //compiles sass
const plumber = require("gulp-plumber"); //prevents pipes from crashing - usefull in gulp-watch
const babel = require("gulp-babel"); //es6 -> es5
const cleanCSS = require("gulp-clean-css"); //minifies css 
const autoprefixer = require("gulp-autoprefixer");



///////////////////////////////////////////////////
// ---------- Source Files -----------------------
//////////////////////////////////////////////////

// folder in which will be source scripts
const scriptExternal = "src/scripts/external/**/*.js";
const scriptApplication = "src/scripts/client/**/*.js";

// sass files
const sassFiles = "sass/**/*.scss";


////////////////////////////////////////////
// --------- Tasks -------------------------
////////////////////////////////////////////

//REMINDER: SRC FILES NEED TO BE IN DIFFERENT FOLDER THAN OUTPUT FILES -> SRC -> DIST or similar

//minifies all external scripts and concats them inside "external.all.min.js" file
gulp.task("external-scripts",()=>{
    return gulp.src(scriptExternal)
    .pipe(plumber({
        errorHandler:(err)=>{
            console.log(err);
            this.emit("end");
        }
    }))
    .pipe(concat("external.all.min.js"))
    .pipe(gulp.dest("public/scripts/external"));
});

// babels (es6 to es5), minifies all application script files and concats them inside "app.all.min.js"file
gulp.task("application-scripts",()=>{
    return gulp.src(scriptApplication)
    .pipe(plumber({
        errorHandler:(err)=>{
            console.log(err);
            this.emit("end");
        }
    }))
    .pipe(babel(
        {
            presets: ["es2015"]
        }
    ))
    .pipe(concat("app.all.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("public/scripts/client/"));
});

// compile sass to css
gulp.task("sass",()=>{
    return gulp.src(sassFiles)
    .pipe(plumber({
        errorHandler:function(err){
            console.log(err);
            this.emit("end");  //for gulp watch to continue after
        }
    })
    )
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(concat("app.styles.css"))
    .pipe(cleanCSS())
    .pipe(gulp.dest("public/css/"));
});

/////////////////
//watch functions
/////////////////

//sass
gulp.task("sass-watch",()=>{
    gulp.watch(sassFiles,["sass"]);
});

//app scripts
gulp.task("app-script-watch",()=>{
    gulp.watch(scriptApplication,["application-scripts"]);
});

/////////////////////////
//watch both - default
///////////////////////////

gulp.task("default",["sass-watch","app-script-watch"]);
