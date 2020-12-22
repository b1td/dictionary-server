let fs = require('fs');
let http = require('http');
let https = require('https');
let url = require('url');


let dictionary = null;



let dictionaryHandler = (request, response) => {
    let decodedUrl = decodeURI(request.url);
    let u = url.parse(decodedUrl);
    response.setHeader('Access-Control-Allow-Origin', '*');
        
    if (u.pathname == '/') {
            response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            response.end('<p style="text-align: center;">Это голоссарий терминов.</p><hr/><p style="text-align: center;"><a href="./mindmap">Mindmap</a></p>');
        return;
    } 

    if (u.pathname == '/readyz') {
        if (dictionary) {
            response.writeHead(200);
            response.end('OK');
        } else {
            response.writeHead(404);
            response.end('Not Loaded');
        }
        return;
    }

     if (u.pathname == '/mindmap') {
        fs.readFile("./mindmap.svg", (err,data) => {
            response.writeHead(200, {'Content-Type': 'text/html' });
            response.end(data)});
            return;
    }
    
    if (u.pathname == '/json') {
        fs.readFile("./dictionary.json", (err,data) => {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(data)});
            return;
    }

    let key = '';
    if (u.pathname.length > 0) {
        key = u.pathname.substr(1).toUpperCase(); 
    }
    let def = dictionary[key];
    
    if (!def) {
        response.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        response.end(key + '<hr>' +'was not found');
        return;
    }
    response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    response.end(key + '<hr>' + def);
}

let downloadDictionary = (url, file, callback) => {
  let stream = fs.createWriteStream(file);
  let req = https.get(url, (res) => {
    res.pipe(stream);
    stream.on('finish', () => {
      stream.close(callback);
      console.log('dictionary downloaded');
    });
  }).on('error', function(err) {
    fs.unlink(file);
    if (callback) cb(err.message);
  });
};

let loadDictionary = (file, callback) => {
    fs.readFile(file, (err, data) => {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        dictionary = JSON.parse(data);
        console.log('dictionary loaded.');
        callback();
    })
};

downloadDictionary('https://raw.githubusercontent.com/b1td/new/main/dictionary.json', 'dictionary.json', (err) => {
    if (err) {
        console.log(err);
        return;
    }
    loadDictionary('dictionary.json', (err) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('ready to serve');
    });
});

const server = http.createServer(dictionaryHandler);

server.listen(8080, (err) => {  
  if (err) {
    return console.log('error starting server: ' + err);
  }

  console.log('server is listening on 8080');
});