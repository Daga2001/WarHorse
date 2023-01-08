//====================================================================================
// LIBRARIES
//====================================================================================
import * as util from './utils.js'
util
//====================================================================================
// DECLARATION OF VARIABLES
//====================================================================================

//canvas
const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');
canvas.width = 800
canvas.height = 800

//Restart button
const restartButton = document.getElementById('restart-game-btn');

//Dimensions
const squareSize = 80

//Sounds
let audioBackground = new Audio(`../sound/main-theme.mp3`)
let hereWeGo = new Audio(`../sound/here-we-go.mp3`)

//world
/**
 * 0 <- empty field
 * 1 <- Horse - player 1
 * 2 <- Horse - player 2
 * 3 <- Red field
 * 4 <- Green field
 * 5 <- Bonus
 */
let world = 
[
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
]

let initWorld = 
[
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
]

// Horse's player 1
let h1 = {
    x: 0,
    y: 0,
    isTurn: true,
}

// Horse's player 2
let h2 = {
    x: 0,
    y: 0,
    isTurn: false,
}

// Tests
let sol = ["up","right","right","right","right","down","right","right","right","right","right","right",
           "down","down","down","down","left","left"]

//====================================================================================
// DECLARATION OF FUNCTIONS OR METHODS
//====================================================================================

/**
 * Abstracts all imposible movements from mario's position.
 * @param {Object} mario 
 * @param {Object} world
 * @returns List
 */

function impossibleMovements(mario, world) {
    let movements = [];
    if(mario.posx == 0) {
        movements.push("left");
    }
    if(mario.posx == world.length - 1) {
        movements.push("right");
    }
    if(mario.posy == 0) {
        movements.push("up");
    }
    if(mario.posy == world.length - 1) {
        movements.push("down");
    }
    if (!(mario.posx == 0)) {
        if(world[mario.posy][mario.posx-1] == 1) {
            movements.push("left");
        }
    }
    if(!(mario.posx == world.length - 1)) {
        if(world[mario.posy][mario.posx+1] == 1) {
            movements.push("right");
        }
    }
    if(!(mario.posy == 0)) {
        if(world[mario.posy-1][mario.posx] == 1) {
            movements.push("up");
        }
    }
    if(!(mario.posy == world.length - 1)) {
        if(world[mario.posy+1][mario.posx] == 1) {
            movements.push("down");
        }
    }
    return movements;
}

/**
 * Displays a square with a defined color.
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} width 
 * @param {Number} height 
 * @param {String} color 
 */

function paintSquare(x,y,width,height,color) {
    ctx.fillStyle = color           //color of fill
    ctx.strokeStyle = "black"            //border's color
    ctx.lineWidth = "2"                //border's width
    ctx.fillRect(x,y,width,height)      //create rectangle
    ctx.strokeRect(x,y,width,height)    //create rectangle's borders
}

/**
 * Abstracts all posible movements from horse's position.
 * @param {Object} horse 
 * @param {Object} world
 * @returns List
 */
// (5,9) -> 1,2,3 X

function possibleMovements(horse, world) {
    let movements = [];
    // 1
    if (horse.x-2 >= 0 && horse.y-1 >= 0 && (world[horse.y-1][horse.x-2] == 0 || world[horse.y-1][horse.x-2] == 5)) {
        movements.push(1);
    }
    // 2
    if (horse.x-1 >= 0 && horse.y-2 >= 0 && (world[horse.y-2][horse.x-1] == 0 || world[horse.y-2][horse.x-1] == 5)) {
        movements.push(2);
    }
    // 3
    if (horse.x+1 < world.length && horse.y-2 >= 0 && (world[horse.y-2][horse.x+1] == 0 || world[horse.y-2][horse.x+1] == 5)) {
        movements.push(3);
    }
    // 4
    if (horse.x+2 < world.length && horse.y-1 >= 0 && (world[horse.y-1][horse.x+2] == 0 || world[horse.y-1][horse.x+2] == 5)) {
        movements.push(4);
    }
    // 5
    if (horse.x+2 < world.length && horse.y+1 < world.length && (world[horse.y+1][horse.x+2] == 0 || world[horse.y+1][horse.x+2] == 5)) {
        movements.push(5);
    }
    // 6
    if (horse.x+1 < world.length && horse.y+2 < world.length && (world[horse.y+2][horse.x+1] == 0 || world[horse.y+2][horse.x+1] == 5)) {
        movements.push(6);
    }
    // 7
    if (horse.x-1 >= 0 && horse.y+2 < world.length && (world[horse.y+2][horse.x-1] == 0 || world[horse.y+2][horse.x-1] == 5)) {
        movements.push(7);
    }
    // 8
    if (horse.x-2 >= 0 && horse.y+1 < world.length && (world[horse.y+1][horse.x-2] == 0 || world[horse.y+1][horse.x-2] == 0)) {
        movements.push(8);
    }
    return movements;
}

console.log(possibleMovements({ x:5, y:9 }, world));

/**
 * Draws an image in canvas with a given source, which means the pic's name.
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} width 
 * @param {Number} height 
 * @param {Number} source 
 */

function showImage(x,y,width,height,source) {
    let img = new Image()
    img.src = `../images/${source}.png`
    img.onload = function() {
        ctx.drawImage(img,x,y,width,height)
    }
}

/**
 * Generates a new world with ramdom positions
 * @param {Object} world 
 */

function makeWorld(world) {
    // --------------------------------------------------------------------
    // Generating random positions
    // --------------------------------------------------------------------

    // function to check if a bonus is adjacent with another one.
    let isAdjacent = function (objects, bonus) {
        for (let i = 0; i < objects.length; i++) {
            if (objects[i].item == "b") {
                if (objects[i].pos == bonus.pos - 1 || 
                    objects[i].pos == bonus.pos + 1 ||
                    objects[i].pos == bonus.pos - 10 ||
                    objects[i].pos == bonus.pos + 10 ||
                    objects[i].pos == bonus.pos - 11 ||
                    objects[i].pos == bonus.pos - 9 ||
                    objects[i].pos == bonus.pos + 9 ||
                    objects[i].pos == bonus.pos + 11) {
                        return true;
                }
            }
        }
        return false;
    }

    // pushs objects and positions into corresponding arrays
    let pushObject = function (objects, positions, name) {
        let object = { pos: util.random_between_a_b(0,10*10-1), item: name };
        if (name == "b"){
            while (positions.includes(object.pos) || isAdjacent(objects, object)) {
                object = { pos: util.random_between_a_b(0,10*10-1), item: name };
            }
        }
        else {
            while (positions.includes(object.pos)) {
                object = { pos: util.random_between_a_b(0,10*10-1), item: name };
            }
        }
        objects.push(object);
        positions.push(object.pos);
    }

    let objects = [];
    let positions = [];
    pushObject(objects, positions, "h1");
    pushObject(objects, positions, "h2");
    pushObject(objects, positions, "b");
    pushObject(objects, positions, "b");
    pushObject(objects, positions, "b");

    // --------------------------------------------------------------------
    // elements insertion
    // --------------------------------------------------------------------
    // Inserts an element into world
    /**
     * 0 <- empty field
     * 1 <- Horse - player 1
     * 2 <- Horse - player 2
     * 3 <- Red field
     * 4 <- Green field
     * 5 <- Bonus
     */
    let insertElement = function (x, y, i, o) {
        if (o[i].item == "h1") {
            world[y][x] = 1;
        }
        else if (o[i].item == "h2") {
            world[y][x] = 2;
        }
        else if (o[i].item == "b") {
            world[y][x] = 5;
        }
    }

    let c = 0; //counter
    for (let y = 0; y < world.length; y++) {
        for (let x = 0; x < world[y].length; x++) {
            for (let i = 0; i < objects.length; i++) {
                if (objects[i].pos == c) {
                    insertElement(x, y, i, objects);
                }
            }
            c++;
        }
    }
}

/**
 * Paints a sketch of possible movements for player 1.
 * @param {Object} horse 
 * @param {Object} world 
 */

function paintPossibleMovements(horse, world) {
    let movements = possibleMovements(horse, world);
    while(movements.length > 0) {
        let move = movements.pop();
        if (move == 1) {
            paintSquare((horse.x-2)*squareSize,(horse.y-1)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move == 2) {
            paintSquare((horse.x-1)*squareSize,(horse.y-2)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move == 3) {
            paintSquare((horse.x+1)*squareSize,(horse.y-2)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move == 4) {
            paintSquare((horse.x+2)*squareSize,(horse.y-1)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move == 5) {
            paintSquare((horse.x+2)*squareSize,(horse.y+1)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move == 6) {
            paintSquare((horse.x+1)*squareSize,(horse.y+2)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move == 7) {
            paintSquare((horse.x-1)*squareSize,(horse.y+2)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move == 8) {
            paintSquare((horse.x-2)*squareSize,(horse.y+1)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else {
            throw `There's an invalid item in movements array: ${move}`;
        }
    }
}

/**
 * Draws and paints all the magnificence of the mario's world.
 * @param {Object} world 
 * @returns
 */

function paintWorld(world) {
    /**
     * 0 <- empty field
     * 1 <- Horse - player 1
     * 2 <- Horse - player 2
     * 3 <- Red field
     * 4 <- Green field
     * 5 <- Bonus
     */
    for (let y = 0; y < world.length; y++){
        for (let x = 0; x < world[y].length; x++){
            if (world[y][x] == 0){
                paintSquare(x*squareSize,y*squareSize,squareSize,squareSize,"white")     
            }
            else if (world[y][x] == 1){
                h1.x = x
                h1.y = y
                paintHorse(h1,"#5bfe3e")
            }
            else if (world[y][x] == 2){
                h2.x = x
                h2.y = y
                paintHorse(h2,"#fa4b2a")
            }
            else if (world[y][x] == 3){
                paintSquare(x*squareSize,y*squareSize,squareSize,squareSize,"#fa4b2a")
            }
            else if (world[y][x] == 4){  
                paintSquare(x*squareSize,y*squareSize,squareSize,squareSize,"#5bfe3e")     
            }
            else if (world[y][x] == 5){
                paintSquare(x*squareSize,y*squareSize,squareSize,squareSize,"#dd9c10")
                showImage(x*squareSize,y*squareSize,squareSize,squareSize,"bonus")
            }
            else {
                throw `There's an invalid item in world's array: ${world[y][x]} at (${x+1},${y+1})`
            }
        }
    }
    paintPossibleMovements(h1, world);
}

/**
 * Draws a horse with its current position and color.
 * @param {Object} horse 
 * @param {Object} world 
 */

function paintHorse(horse, color) {
    paintSquare(horse.x*squareSize,horse.y*squareSize,squareSize,squareSize,color)
    showImage(horse.x*squareSize,horse.y*squareSize,squareSize,squareSize,"horse")
}

/**
 * Turns mario in a given direction and paints him.
 * @param {String} dir: "up", "down", "left", "right"
 */

function moveMario(dir) {
    let impossiblesM = impossibleMovements(mario, world);
    if(dir == "up" && !impossiblesM.includes("up")) {
        paintSquare(mario.posx*squareSize,mario.posy*squareSize,squareSize,squareSize,"white")
        world[mario.posy][mario.posx] = 0;
        world[mario.posy-1][mario.posx] = 2;
        mario.posy -= 1;
        paintHorse(mario)
    }
    if(dir == "down" && !impossiblesM.includes("down")) {
        paintSquare(mario.posx*squareSize,mario.posy*squareSize,squareSize,squareSize,"white")
        world[mario.posy][mario.posx] = 0;
        world[mario.posy+1][mario.posx] = 2;
        mario.posy += 1;
        paintHorse(mario)
    }
    if(dir == "left" && !impossiblesM.includes("left")) {
        paintSquare(mario.posx*squareSize,mario.posy*squareSize,squareSize,squareSize,"white")
        world[mario.posy][mario.posx] = 0;
        world[mario.posy][mario.posx-1] = 2;
        mario.posx -= 1;
        paintHorse(mario)
    }
    if(dir == "right" && !impossiblesM.includes("right")) {
        paintSquare(mario.posx*squareSize,mario.posy*squareSize,squareSize,squareSize,"white")
        world[mario.posy][mario.posx] = 0;
        world[mario.posy][mario.posx+1] = 2;
        mario.posx += 1;
        paintHorse(mario)
    }
}

/**
 * Ends with all the mario's world, when mario losses or wins.
 */

function endGame() {
    let endScreen = document.getElementById('end-screen');
    let container = document.getElementById('container');
    endScreen.style.display = `flex`;
    container.style.display = `none`;
}

/**
 * Restarts the mario's game with the same world.
 */

function restartGame() {
    world = deep_copy(initWorld);
    
    paintWorld(world);
    let endScreen = document.getElementById('end-screen');
    let container = document.getElementById('container');
    endScreen.style.display = `none`;
    container.style.display = `flex`;
}

/**
 * Performs the next mario's movement.
 * @param {Object} mario 
 * @param {List} sol 
 */

function nextMovement(sol) {
    let nextMov = sol.shift()
    console.log(sol)
    moveMario(nextMov)
}

//====================================================================================
// logical structure
//====================================================================================

try{
    // Plays the background music
    // audioBackground.currentTime = 0
    // audioBackground.loop = true
    // audioBackground.play()
    // hereWeGo.currentTime = 0
    // hereWeGo.play()

    // sets the world
    makeWorld(world);

    // The world is painted at the beginning
    paintWorld(world);
    console.log(h1);
    console.log(h2);
    console.log(world);
    console.log(possibleMovements(h1,world));

    // When mario starts to move
    // let intervalID = setInterval(() => {
    //     nextMovement(sol);
    //     if(mario.posx == princess.posx && mario.posy == princess.posy) {
    //         clearInterval(intervalID);
    //         endGame();
    //     }
    // }, 1000)    

    // Button listener
    restartButton.addEventListener('mousedown', () => {
        restartGame();
    })

    // Key listener
    // document.body.addEventListener('keydown', ( event ) => {
    //     if(event.key == "ArrowUp") {
    //         moveMario("up")
    //     }
    //     if(event.key == "ArrowDown") {
    //         moveMario("down")
    //     }
    //     if(event.key == "ArrowLeft") {
    //         moveMario("left")
    //     }
    //     if(event.key == "ArrowRight") {
    //         moveMario("right")
    //     }
    // })
}
catch(e) {
    console.error(`An error has occurred during game's execution: ${e}`);
}
