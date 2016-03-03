var app = require('express')(),
    http = require('http').Server(app),
    chokidar = require('chokidar'),
    fs = require('fs'),
    io = require('socket.io')(http),
    Handlebars = require('handlebars');

var argv = require('minimist')(process.argv.slice(2),
    {
        default: {
            hbs: true,
            scss: true
        }
    }
),

    directories = dirsToBrowse(),
    watcher = chokidar.watch(directories, {
        persistent: true,
        depth: 2,
    });

console.log(argv);
// need to add full generic validation for params see what is required and what is not.
if (!argv['s']) {
    console.log('PARAM IS REQUIRED: -s provide the wrapper DOM selector that will be reloaded on change');
    console.log('USE PATTERN: npm run witness -- -s <wrapperClass>');
    process.exit(1);
}

watcher.on('change', function(path) {
    var response = generateResponse(path);
    console.log(response);
    io.emit('file-updated', response);
});

io.on('connection', function(socket){
  console.log('Connected!!!');
});

io.on('disconnect', function(socket){
  console.log('disconnect!!!');
});

http.listen(4545, function(){
  console.log('listening on *:4545');
});


//not in use
function createFilePathes(filesArr) {
    // verry dummy functioins. assumes that file is folder/file.hbs format (without first slash) and the path ends with /
    // have no validation whether the file exists
    filesArr.map(file => path + file);
}

function generateResponse(path) {
    return responseFor[fileType(path)](path);
}

function fileType(path) {
    var arr = path.split('.');
    return arr[arr.length - 1];
}

function dirsToBrowse() {
    var dirs = [],

    // pathes should come from some kind of configs file (JSON)
    hbs_path = '../5rr_v2/app/assets/javascripts/templates/',
    css_path = '../5rr_v2/app/assets/stylesheets';

    if (argv['scss']) {
        dirs.push(css_path);
    }

    if (argv['hbs']) {
        dirs.push(hbs_path);   
    }

    return dirs;
}

var responseFor = {
    hbs: function(path) {
        var source = fs.readFileSync(path, 'utf8');
        template = Handlebars.compile(source),

        // handlebars data
        data = {}, // TODO: this should be in a config file
        result = template(data),
        response = {
            fileType: 'hbs',
            selector: argv['s'],
            html: result
        }
        return response;
    },

    scss: function(path) {
        response = {
            fileType: 'scss',
            filePath: path
        }
        return response;
    }
}

/*  TODO:
    add handlebars helpers support
    add full generic validation for params see what is required and what is not.
    settings file (json) for grabber
    modular architecture
    scss support
*/