const util = require('node:util');
const http = require('node:http');
const fs = require('node:fs/promises');
const { json } = require('node:stream/consumers');

let listings = JSON.parse(require('node:fs').readFileSync("./listings.json", "utf-8"))
//import listings from './listings.json' with {type: "json"};

function serve() {
    const server = http.createServer(async (req, res) => {
        let url = require('url').parse(req.url)
        console.log(`Request: ${url.pathname}`);
        if (req.method == 'POST' && url.pathname == '/neighbor') {
            let data;
            try {
                data = await json(req);
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({error: "couldn't parse json request"}));
                return;
            }
            let resp = find_match(data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(resp));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({error: "Not Found"}));
        }
    });
    
    server.on('clientError', (err, socket) => {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

    server.on('request', (req) => {
    });

    server.listen(process.env.PORT ?? 5000);
}

function find_match(d){
    return { test: "test response" };
}

serve();
