var map_string =
"TTTTTTTTTTTTTTTTTTTTTTTTT" +
"T~~~~~~~~~~~~~~~~~~~~~~~T" +
"T~~~~~~~~~~~~~~~~~~~~~~~T" +
"T~~~~~~~~~~~~~~~~~~~~~~~T" +
"T~~~~~~~~~~~~~~~~~~~~~~~T" +
"TTT~~~~~~~~...~~~~~~~~TTT" +
"TTTTT~~~~~~...~~~~~~TTTTT" +
"TTTTTTT~~~~...~~~~TTTTTTT" +
"TTTTTTTTT~~~.~~~TTTTTTTTT" +
"TTTTTTTTT~~~.~~~TTTTTTTTT" +
"TTTTTTTTTTTT.TTTTTTTTTTTT" +
"TTTTTTTTTTT...TTTTTTTTTTT" +
"TTTTTTTTTTT...TTTTTTTTTTT" +
"TTTTTTTTTT.....TTTTTTTTTT" +
"TTTTTTTTTT.....TTTTTTTTTT" +
"TTTTTTTTTT.....TTTTTTTTTT" +
"TTTTTTTTTTT...TTTTTTTTTTT" +
"TTTTTTTTTTTT.TTTTTTTTTTTT" +
"TTTTTTTTTTTT.TTTTTTTTTTTT" +
"TTTTTTTTTTTT.TTTTTTTTTTTT";

function string_to_map(s) {
    var map = new Array();
    var map_width = 25;
    var map_height = 20;
	for (y=0; y<map_height; y++) {
		map.push([]);
		for(x=0; x<map_width; x++) {
            var character = s.charAt((y*map_width)+x);
			if (character === "T") {
				map[y].push({
                    type: "tree",
                    solid: true,
                    x: x,
                    y: y
                });
			} else if (character === "~") {
				map[y].push({
                    type: "water",
                    solid: true,
                    x: x,
                    y: y
                });
			} else if (character === ".") {
                map[y].push({
                    type: "ground",
                    solid: false,
                    x: x,
                    y: y
                });
            }
		}
	}
	return map;
}

var map = string_to_map(map_string);
var item_number = 0;
var items = {};

var clients = {};
var players = {};

var app = require("http").createServer()
  , io = require("socket.io").listen(app)
  , fs = require("fs")

app.listen(8031, "0.0.0.0");

io.sockets.on("connection", function (socket) {
    clients[socket.id] = socket;
    socket.emit("map", map_string);
    socket.emit("populate", {
        players: players,
        items: items
    });
    socket.on("join", function (data) {
        players[socket.id] = {
            username: socket.id,
            x: 12,
            y: 6,
            inventory: {}
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
        var nx = players[socket.id].x;
        var ny = players[socket.id].y;
        if (data.direction === "north") {
            ny -= 1;
        } else if (data.direction === "east") {
            nx += 1;
        } else if (data.direction === "south") {
            ny += 1;
        } else if (data.direction === "west") {
            nx -= 1;
        }
        
        if (map[ny][nx].solid === false) {
            players[socket.id].x = nx;
            players[socket.id].y = ny;
        }

        if (map[ny][nx].type === "water") {
            item_number++;
            var salmon = {
                item_id: item_number,
                item_name: "salmon",
                x: players[socket.id].x,
                y: players[socket.id].y
            };
            items[item_number] = salmon;
            for (c in clients) {
                clients[c].emit("item_drop", salmon);
            }
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
