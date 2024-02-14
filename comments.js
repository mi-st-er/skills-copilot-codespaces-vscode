// Create web server

// Load HTTP module
var http = require("http");
var fs = require("fs");
var url = require("url");
var path = require("path");
var qs = require("querystring");

// Create HTTP server and listen on port 8001 for requests
http.createServer(function (req, res) {
    // Set the response HTTP header with HTTP status and Content type
    res.writeHead(200, { "Content-Type": "text/html" });

    // Send the response body "Hello World"
    if (req.url === "/") {
        fs.readFile("index.html", function (err, data) {
            res.write(data);
            res.end();
        });
    } else if (req.url === "/getComments") {
        fs.readFile("comments.json", "utf8", function (err, data) {
            res.write(data);
            res.end();
        });
    } else if (req.url === "/addComment") {
        var postData = "";
        req.on("data", function (data) {
            postData += data;
        });
        req.on("end", function () {
            var comment = qs.parse(postData);
            fs.readFile("comments.json", "utf8", function (err, data) {
                var comments = JSON.parse(data);
                comments.push(comment);
                fs.writeFile("comments.json", JSON.stringify(comments), function () {
                    res.end();
                });
            });
        });
    } else {
        var uri = url.parse(req.url).pathname;
        var filename = path.join(process.cwd(), uri);
        fs.exists(filename, function (exists) {
            if (!exists) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found\n");
                res.end();
                return;
            }
            if (fs.statSync(filename).isDirectory()) filename += "/index.html";
            fs.readFile(filename, "binary", function (err, file) {
                if (err) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.write(err + "\n");
                    res.end();
                    return;
                }
                res.writeHead(200);
                res.write(file, "binary");
                res.end();
            });
        });
    }
}).listen(8001);
