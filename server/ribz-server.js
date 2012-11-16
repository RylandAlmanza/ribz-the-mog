var map_string = "TTTTTTTTTTTTTTTTTTTTTTTTTT~~~~~~~~~~~~~~~~~~~~~~~TT~~~~~~~~~~~~~~~~~~~~~~~TT~~~~~~~~~~~~~~~~~~~~~~~TT~~~~~~~~~~~~~~~~~~~~~~~TTTT~~~~~~~~   ~~~~~~~~TTTTTTTT~~~~~~   ~~~~~~TTTTTTTTTTTT~~~~   ~~~~TTTTTTTTTTTTTTTT~~~ ~~~TTTTTTTTTTTTTTTTTT~~~ ~~~TTTTTTTTTTTTTTTTTTTTT TTTTTTTTTTTTTTTTTTTTTTT   TTTTTTTTTTTTTTTTTTTTTT   TTTTTTTTTTTTTTTTTTTTT     TTTTTTTTTTTTTTTTTTTT     TTTTTTTTTTTTTTTTTTTT     TTTTTTTTTTTTTTTTTTTTT   TTTTTTTTTTTTTTTTTTTTTTT TTTTTTTTTTTTTTTTTTTTTTTT TTTTTTTTTTTTTTTTTTTTTTTT TTTTTTTTTTTT"

var clients = {};
var players = {};

var app = require("http").createServer()
  , io = require("socket.io").listen(app)
  , fs = require("fs")

app.listen(8031, "0.0.0.0");

io.sockets.on("connection", function (socket) {
    clients[socket.id] = socket;
    socket.emit("map", map_string);
    socket.emit("populate", players);
    socket.on("join", function (data) {
        players[socket.id] = {
            username: socket.id,
            x: 12,
            y: 6
        };
        for (c in clients) {
            if (c === socket.id) {
                socket.emit("join", players[socket.id]);
            } else {
                clients[c].emit("add_player", players[socket.id]);
            }
        }
    });

    socket.on("move", function (data) {
        if (data.direction === "north") {
            players[socket.id].y -= 1;
        } else if (data.direction === "east") {
            players[socket.id].x += 1;
        } else if (data.direction === "south") {
            players[socket.id].y += 1;
        } else if (data.direction === "west") {
            players[socket.id].x -= 1;
        }
        for (c in clients) {
            if (c === socket.id) {
                socket.emit("move", players[socket.id]);
            } else {
                clients[c].emit("move_player", players[socket.id]);
            }
        }
    });
});
