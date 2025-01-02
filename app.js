const express = require('express');
const helmet = require('helmet');
const app = express();
const http = require("http");
const https = require("https");
const path = require("path");
const fs = require("fs");
const socketio = require("socket.io");

const httpsOptions = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};
    
const server = https.createServer(httpsOptions, app);
//const server = http.createServer(app);
const io = socketio(server);
app.use(
    helmet({
        crossOriginOpenerPolicy: false,
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": ["'self'"],
                "script-src": [
                    "'self'",
                    "'wasm-unsafe-eval'",
                    "'inline-speculation-rules'",
                    "https://apis.google.com",
                    "https://cdnjs.cloudflare.com",
                    "https://cdn.socket.io",
                ],
                "style-src": ["'self'", "https://cdnjs.cloudflare.com"],
                "connect-src": ["'self'", "https://cdn.socket.io"],
                "img-src": [
                    "'self'",
                    "data:",
                    "https://a.tile.openstreetmap.org",
                    "https://c.tile.openstreetmap.org",
                    "https://b.tile.openstreetmap.org",
                    "https://cdnjs.cloudflare.com",
                ],
                "font-src": ["'self'", "https://cdnjs.cloudflare.com"],
            },
        },
    })
);

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function(socket){
    socket.on("send-location", function(data){
        io.emit("receive-location", {id: socket.id, ...data});
    });

    socket.on("disconnect", function(){
        io.emit("user-disconnect")
    })
});

app.get("/", function (req, res){
    res.render("index");
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://localhost:3000');
});
