/*
 * Krapformer - Kaleb K.
 *
 * LOGS:
 * 4/1 - Created HTML page for program
 * 4/2 - Outlined project, initialized canvas, main method, image importing
 * 4/3 - Bug fixes, keyboard input, basic character movement
 * 4/4 - Bug creations, buggy camera, buggy variable jump system
 * 4/5 - Implemented maps, tiles, and collision (very buggy)
 * 4/6 - Major bug fixes, variable jump improved, movement improved
 * 4/7 - Restructured and cleaned code
 * 4/9 - Finalized jump system, collision, and improved tile loading
*/

var canvas = document.getElementById('krapformer_canvas');
var ctx = canvas.getContext('2d');

/********************************** variables **********************************/
var c_arrowKeys = ["KeyA", "KeyD", "KeyW", "KeyS"];
var b_arrowKeys = [false, false, false, false]; // lrud

var paused = false;
var pressPaused = false;

const gravity = 4;
const terminalVelocity = 15;
/********************************** classes **********************************/
class Sprite {
    constructor(src) {
        this.img = new Image();
        this.img.src = src; // load image from path first
    }

    draw(x, y, w, h, hFlip, vFlip) {
        this.x = x || 0;
        this.y = y || 0;
        this.w = w || this.img.width;
        this.h = h || this.img.height;
        this.hFlip = hFlip;
        this.vFlip = vFlip;
        if(this.hFlip && this.vFlip) {
            ctx.translate(this.x + this.w, this.y + this.h);
            ctx.scale(-1, -1);
        } else if(this.hFlip == 1) { // for some odd reason cannot simply pass this.hFlip
            ctx.translate(this.x + this.w, this.y);
            ctx.scale(-1, 1);
        } else if(this.vFlip == 1) {
            ctx.translate(this.x, this.y + this.h);
            ctx.scale(1, -1);
        } else { // default
            ctx.translate(this.x, this.y);
            ctx.scale(1, 1);
        }
    
        ctx.drawImage(this.img, 0, 0, this.w, this.h);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}

class Tile {
    constructor(src, x, y, w, h) {
        this.src = src;
        this.spr = new Sprite(this.src);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h || w;
    }
}

class Map {
    constructor(name, src, x, y, w, h, tiles) {
        this.src = src;
        this.spr = new Sprite(this.src);

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.name = name;
        this.tiles = tiles;
    }

    draw() {
        this.spr.draw(this.x, this.y, this.w, this.h);
        for(let i = 0; i < this.tiles.length; i++) { // draw all tiles by looping through tile array
            this.tiles[i].spr.draw(this.x + this.tiles[i].x, this.y + this.tiles[i].y, this.tiles[i].w, this.tiles[i].h);
        }
    }
}

class Camera {
    constructor(x, y) {
        // x and y are top-left coordinates of the camera rectangle relative to the map
        this.x = x || 0;
        this.y = y || 0;
    }
    
    focus(map, player) { // update player position based on camera position
        this.x = constrain(player.x + player.w/2, 0, map.w - canvas.width);
        this.y = constrain(player.y + player.y/2, 0, map.h - canvas.height);
    }
}

class Character {
    constructor(src, x, y, w, h) {
        this.src = src;
        this.x = x; // represents position in map
        this.y = y;
        this.w = w;
        this.h = h;
    }

    restrict(map) {
        if(this.x <= 0) this.x = 0;
        if(this.x >= map.w - this.w) this.x = map.w - this.w;
        if(this.y >= map.h - this.h) {
            this.y = map.h - this.h/2;
            this.yv = 0;
            this.y = 0;
            console.log("you died");
        }
    }
    
    colliding(map, direction) {
        for(var i = 0; i < map.tiles.length; i++) {
            if(direction == "v") {
                if(this.x + this.w > map.tiles[i].x && this.x < map.tiles[i].x + map.tiles[i].w) {
                    return this.y + this.h > map.tiles[i].y && this.y < map.tiles[i].y + map.tiles[i].y ? "bottom": this.y < map.tiles[i].y + map.tiles[i].y ? "top" : "none";
                }
            } else if(direction == "h") {
                if(this.y + this.h > map.tiles[i].y && this.y > map.tiles[i].y + map.tiles[i].y) {
                    return this.x + this.w > map.tiles[i].x ? "right": this.x < map.tiles[i].x + map.tiles[i].w ? "left" : "none";
                } 
            }
        }
        return "none";
    }
}

class Player extends Character {
    constructor(src, x, y, w, h) {
        super(src, x, y, w, h);

        this.xv = 0;
        this.yv = gravity;
        this.flipped = 0;
        this.oldFlipped = 0; // for drawing
        this.friction = 0.85;

        this.jumps = 0;
        this.jumpV = -6;
        this.maxJumpV = -30;

        //stats
        this.deaths = 0;

        // image buffering
        this.spr = new Sprite(this.src);
    }

    update(map) {
        this.y += this.yv;
        this.x += this.xv;
        this.yv += gravity;
        this.flipped = b_arrowKeys[1] - b_arrowKeys[0]; // change direction of player based on casted bool to int

        this.xv += 0.4 * this.flipped;
        if(this.colliding(map, "v") == "bottom") {
            this.yv = 0;
            this.jumps = 1;
            if (this.yv > 0) { // when player runs off platform
                jumps--;
            }
        }

        if(this.colliding(map, "h") == "right" || this.colliding(map, "h") == "left") {
            this.xv = 0;
        }

        this.jumpingUp = null;
        if(this.jumps > 0 && b_arrowKeys[2]) {
            this.yv += -4;
            if(this.yv < this.maxJumpV) this.jumps--; // once player reaches maximum jump velocity, stop it from jumping further
        }

        this.xv = constrain(this.xv, -20, 20);
        this.yv = constrain(this.yv, -100, terminalVelocity);

        // drawing
        if(this.flipped != 0) this.oldFlipped = this.flipped;
        else this.xv *= this.friction; // when player not either l/r slow them down
        this.spr.draw(this.x, this.y, this.w, this.h, this.oldFlipped, 0);

        this.restrict(map, this); // restrict where player can go

        // debug
        if(paused) {
            console.log(this.x + " " + this.y + " " + this.xv + " " + this.yv)
            for(var i = 0; i < map.tiles.length; i++) {
                console.log("map tiles: " + map.tiles[i].src + "; x: " + map.tiles[i].x + " y: " + map.tiles[i].y);
            }
        }
    }
}

/********************************** helper methods **********************************/
function constrain(val, min, max) {
    return val < min ? min : (val > max ? max : val);
}

function inRange(val, min, max) {
    return val > min && val < max;
}

/********************************** main program **********************************/
window.onload = function() {main();}

var camera = new Camera(0, 0);
var maps = {
    default: new Map("test", "krapformer/bg.jpg", 0, 0, 1920, 1080, [
        new Tile("krapformer/grass.jpg", 0, 500, 64, 64),
        new Tile("krapformer/grass.jpg", 120, 436, 64, 64)
    ])
};
var player = new Player("krapformer/player.png", 0, 100, 100, 100);

var currentMap = maps.default;

function main() {
    // begin render
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // configure camera
    //camera.focus(currentMap, player);
    //ctx.translate(-camera.x, -camera.y);

    // draw content
    currentMap.draw();
    player.update(currentMap, camera.x, camera.y);

    // end render
    window.requestAnimationFrame(main); // render every time frame is ready to be drawn
}

/********************************** event listeners **********************************/
document.addEventListener('keydown', (e) => {
    for(var i = 0; i < c_arrowKeys.length; i++) if(e.code === c_arrowKeys[i]) b_arrowKeys[i] = true;
});
document.addEventListener('keyup', (e) => {
    for(var i = 0; i < c_arrowKeys.length; i++) if(e.code === c_arrowKeys[i]) b_arrowKeys[i] = false;
    if(e.code == "Escape") { paused = paused ? false: true; }
});
// document.addEventListener('keypress', (e) => {
    
// });