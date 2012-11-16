window.onload = function () {

    //start crafty
	var GAME_WIDTH = 800;
	var GAME_HEIGHT = 640;
    var SPRITE_SIZE = 32;
    var socket = undefined;

    Crafty.init(GAME_WIDTH, GAME_HEIGHT);
    Crafty.sprite(SPRITE_SIZE, "img/sprites-scaled.png", {
        man: [0, 0],
        skull: [1, 0],
        tree: [0, 1],
        pine: [1, 1],
        water: [0, 2],
        lava: [1, 2],
        salmon: [0, 3],
        sword: [0, 4],
        fishing_pole: [1, 4]
    });

	function parse_map(map_string) {
		var map = new Array();
        var map_width = 25;
        var map_height = 20;
		for (y=0; y<map_height; y++) {
			map.push([]);
			for(x=0; x<map_width; x++) {
                var character = map_string.charAt((y*map_width)+x);
				if (character === "T") {
					map[y].push(Crafty.e("2D, DOM, tree")
					.attr({
						x: x * SPRITE_SIZE,
						y: y * SPRITE_SIZE,
						w: SPRITE_SIZE,
						h: SPRITE_SIZE
					}));
				} else if (character === "~") {
					map[y].push(Crafty.e("2D, DOM, water")
					.attr({
						x: x * SPRITE_SIZE,
						y: y * SPRITE_SIZE,
						w: SPRITE_SIZE,
						h: SPRITE_SIZE
					}));
				} else if (character === ".") {
                    map[y].push(undefined);
                }
			}
		}
		return map;
	}

    Crafty.scene("loading", function() {
        Crafty.background("#000");
		Crafty.e("2D, DOM, Text")
        .attr({
            w: 100,
            h: 20,
            x: 150,
            y: 120
        })
        .text("Loading")
        .css({"text-align": "center"});
		Crafty.load(["img/sprites-scaled.png"], function() {
		    Crafty.scene("main");
		});
    });

    Crafty.scene("main", function() {
        Crafty.background("#000");
        var player = undefined;
        var remote_players = {};
        var items = {};
        var map = undefined;

		socket = io.connect("76.105.244.177:8031");
        socket.on("map", function(data) {
            map = parse_map(data);
            socket.emit("join", {
                username: "Ryland"
            });
        });

        socket.on("join", function(data) {
            player = Crafty.e("2D, DOM, man, CustomControls")
            .attr({
                x: data.x * SPRITE_SIZE,
                y: data.y * SPRITE_SIZE,
                w: SPRITE_SIZE,
                h: SPRITE_SIZE,
                username: data.username
            });
            player.CustomControls();
        });
        
        socket.on("populate", function(data) {
            for (i in data.players) {
                remote_players[i] = Crafty.e("2D, DOM, man")
                .attr({
                    x: data.players[i].x * SPRITE_SIZE,
                    y: data.players[i].y * SPRITE_SIZE,
                    w: SPRITE_SIZE,
                    h: SPRITE_SIZE,
                    username: data.players[i].username
                });
            }

            for (i in data.items) {
                if (data.items[i].item_name === "salmon") {
                    items[i] = Crafty.e("2D, DOM, salmon")
                    .attr({
                        x: data.items[i].x * SPRITE_SIZE,
                        y: data.items[i].y * SPRITE_SIZE,
                        w: SPRITE_SIZE,
                        h: SPRITE_SIZE,
                        item_name: data.items[i].item_name,
                        item_id: i
                    });
                }
            }                
        });

        socket.on("add_player", function(data) {
            remote_players[data.username] = Crafty.e("2D, DOM, man")
            .attr({
                x: data.x * SPRITE_SIZE,
                y: data.y * SPRITE_SIZE,
                w: SPRITE_SIZE,
                h: SPRITE_SIZE,
                username: data.username
            });
        });

        socket.on("move", function(data) {
            player.x = data.x * SPRITE_SIZE;
            player.y = data.y * SPRITE_SIZE;
        });

        socket.on("move_player", function(data) {
            remote_players[data.username].x = data.x * SPRITE_SIZE;
            remote_players[data.username].y = data.y * SPRITE_SIZE;
        });

        socket.on("item_drop", function(data) {
            items[data.item_id] = Crafty.e("2D, DOM, salmon")
            .attr({
                x: data.x * SPRITE_SIZE,
                y: data.y * SPRITE_SIZE,
                w: SPRITE_SIZE,
                h: SPRITE_SIZE,
                item_name: data.item_name,
                item_id: data.item_id
            });
        });
    });


    Crafty.c("CustomControls", {
        CustomControls: function() {
            this.bind("KeyDown", function(e) {                
                if (e.key === Crafty.keys.UP_ARROW) {
                    socket.emit('move', {
                        direction: "north"
                    });
                } else if (e.key === Crafty.keys.DOWN_ARROW) {
                    socket.emit('move', {
                        direction: "south"
                    });
                } else if (e.key === Crafty.keys.LEFT_ARROW) {
                    socket.emit('move', {
                        direction: "west"
                    });
                } else if (e.key === Crafty.keys.RIGHT_ARROW) {
                    socket.emit('move', {
                        direction: "east"
                    });
                }
            });
        }
    });

    Crafty.scene("loading");
}
