const util = require('node:util');
const http = require('node:http');
const fs = require('node:fs/promises');
const { json } = require('node:stream/consumers');

// Import our listings form JSON and rearrange to be location based
let listings = JSON.parse(require('node:fs').readFileSync("./listings.json", "utf-8"))
let locations = {}
for (let listing of listings) {
    if (locations[listing.location_id] == undefined)
        locations[listing.location_id] = [];
    locations[listing.location_id].push({id: listing.id, length: listing.length, width: listing.width, price: listing.price_in_cents});
}

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

const permutator = (inputArr) => {
    let result = [];

    const permute = (arr, m = []) => {
        if (arr.length === 0) {
            result.push(m)
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next))
            }
        }
    }

    permute(inputArr)

    return result;
}

function pack (listings, cars_in) {
    let cars = cars_in.slice();
    let price = 0;
    let ids = [];

    for (let listing of listings) {
        // No more cars - Done
        if (cars.length == 0)
            break;

        // Record next required space
        ids.push(listing.id);
        price += listing.price;

        // Fill up each 10 foot wide lane with as many cars as we can
        for (let lane=0; lane<listing.width; lane+=10) {
            let length = listing.length;
            for (let car of cars) {
                if (car < length) {
                    // Remove car
                    cars.splice(cars.indexOf(car), 1);
                    // Shorten available lane space
                    length -= car;
                }
            }
        }
    }

    // Couldn't fit!
    if (cars.length != 0)
        return -1

    // Could fit!
    return {
        price: price,
        ids: ids
    };
}

function permute_and_pack(listings, cars) {
    let best_price = -1;
    let best_ids = [];

    // Permute arrangements of listings to find best packing order
    for (let permuted_listings of permutator(listings)) {
        let result = pack(permuted_listings, cars);

        if (result != -1)
            if (result.price < best_price || best_price == -1) {
                best_price = result.price;
                best_ids = result.ids;
            }
    }

    if (best_price == -1)
        return null;

    return {
        price: best_price,
        ids: best_ids,
    };
}

function find_best_pack(location_id, listings, cars) {
    let best_pack = permute_and_pack(listings, cars);

    if (best_pack == null)
        return null;

    return {
        "location_id": location_id,
        "listing_ids": best_pack.ids,
        "total_price_in_cents": best_pack.price
    };
}

function sort_by_price(a) {
    return a.sort(function(a,b) {
        return a.total_price_in_cents - b.total_price_in_cents
    });
}

function find_match(request){
    let results = [];

    // Create list of cars that is largest to smallest based on our input requests
    let cars = []
    for (let car of request)
        for (let i=0; i<car.quantity; i++)
            cars.push(car.length);

    cars.sort().reverse();

    // Find all locations with enough appropriately-sized spots
    for (let lid in locations) {
        let result = find_best_pack(lid, locations[lid], cars);

        if (result != null)
            results.push(result);
    }

    // Sort results based on price
    return sort_by_price(results);
}

serve();
