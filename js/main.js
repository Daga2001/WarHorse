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
// Cursor
let cursor = {
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
}

// Horse's player 1
let h1 = {
    x: 0,
    y: 0,
    isTurn: false,
    possibleMovements: [],
    selectedMove: 0, // index of possibleMovements array
    nBoxes: 1,
}

// Horse's player 2
let h2 = {
    x: 0,
    y: 0,
    isTurn: true,
    possibleMovements: [],
    selectedMove: 0, // index of possibleMovements array
    nBoxes: 1,
}

// tree
let tree = {
    x: 0,
    y: 0,
    depth: 0,
}

// computing time
let computingTime = 0;

// Tests
let sol = ["up","right","right","right","right","down","right","right","right","right","right","right",
           "down","down","down","down","left","left"]

//====================================================================================
// DECLARATION OF FUNCTIONS OR METHODS
//====================================================================================

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

function possibleMovements(horse, world) {
    let movements = [];
    // 1
    if (horse.x-2 >= 0 && horse.y-1 >= 0 && (world[horse.y-1][horse.x-2] == 0 || world[horse.y-1][horse.x-2] == 5)) {
        movements.push({ x: horse.x-2, y: horse.y-1, bonus: world[horse.y-1][horse.x-2] == 5, dir: 1});
        horse.possibleMovements.push({ x: horse.x-2, y: horse.y-1, bonus: world[horse.y-1][horse.x-2] == 5, dir: 1});
    }
    // 2
    if (horse.x-1 >= 0 && horse.y-2 >= 0 && (world[horse.y-2][horse.x-1] == 0 || world[horse.y-2][horse.x-1] == 5)) {
        movements.push({ x: horse.x-1, y: horse.y-2, bonus: world[horse.y-2][horse.x-1] == 5, dir: 2});
        horse.possibleMovements.push({ x: horse.x-1, y: horse.y-2, bonus: world[horse.y-2][horse.x-1] == 5, dir: 2});
    }
    // 3
    if (horse.x+1 < world.length && horse.y-2 >= 0 && (world[horse.y-2][horse.x+1] == 0 || world[horse.y-2][horse.x+1] == 5)) {
        movements.push({ x: horse.x+1, y: horse.y-2, bonus: world[horse.y-2][horse.x+1] == 5, dir: 3});
        horse.possibleMovements.push({ x: horse.x+1, y: horse.y-2, bonus: world[horse.y-2][horse.x+1] == 5, dir: 3});
    }
    // 4
    if (horse.x+2 < world.length && horse.y-1 >= 0 && (world[horse.y-1][horse.x+2] == 0 || world[horse.y-1][horse.x+2] == 5)) {
        movements.push({ x: horse.x+2, y: horse.y-1, bonus: world[horse.y-1][horse.x+2] == 5, dir: 4});
        horse.possibleMovements.push({ x: horse.x+2, y: horse.y-1, bonus: world[horse.y-1][horse.x+2] == 5, dir: 4});
    }
    // 5
    if (horse.x+2 < world.length && horse.y+1 < world.length && (world[horse.y+1][horse.x+2] == 0 || world[horse.y+1][horse.x+2] == 5)) {
        movements.push({ x: horse.x+2, y: horse.y+1, bonus: world[horse.y+1][horse.x+2] == 5, dir: 5});
        horse.possibleMovements.push({ x: horse.x+2, y: horse.y+1, bonus: world[horse.y+1][horse.x+2] == 5, dir: 5});
    }
    // 6
    if (horse.x+1 < world.length && horse.y+2 < world.length && (world[horse.y+2][horse.x+1] == 0 || world[horse.y+2][horse.x+1] == 5)) {
        movements.push({ x: horse.x+1, y: horse.y+2, bonus: world[horse.y+2][horse.x+1] == 5, dir: 6});
        horse.possibleMovements.push({ x: horse.x+1, y: horse.y+2, bonus: world[horse.y+2][horse.x+1] == 5, dir: 6});
    }
    // 7
    if (horse.x-1 >= 0 && horse.y+2 < world.length && (world[horse.y+2][horse.x-1] == 0 || world[horse.y+2][horse.x-1] == 5)) {
        movements.push({ x: horse.x-1, y: horse.y+2, bonus: world[horse.y+2][horse.x-1] == 5, dir: 7});
        horse.possibleMovements.push({ x: horse.x-1, y: horse.y+2, bonus: world[horse.y+2][horse.x-1] == 5, dir: 7});
    }
    // 8
    if (horse.x-2 >= 0 && horse.y+1 < world.length && (world[horse.y+1][horse.x-2] == 0 || world[horse.y+1][horse.x-2] == 5)) {
        movements.push({ x: horse.x-2, y: horse.y+1, bonus: world[horse.y+1][horse.x-2] == 5, dir: 8});
        horse.possibleMovements.push({ x: horse.x-2, y: horse.y+1, bonus: world[horse.y+1][horse.x-2] == 5, dir: 8});
    }
    return movements;
}

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
        if (move.dir == 1) {
            if (move.bonus) {
                showImage((horse.x-2)*squareSize,(horse.y-1)*squareSize,squareSize,squareSize,"bonus");
            }
            paintSquare((horse.x-2)*squareSize,(horse.y-1)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move.dir == 2) {
            if (move.bonus) {
                showImage((horse.x-1)*squareSize,(horse.y-2)*squareSize,squareSize,squareSize,"bonus");
            }
            paintSquare((horse.x-1)*squareSize,(horse.y-2)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move.dir == 3) {
            if (move.bonus) {
                showImage((horse.x+1)*squareSize,(horse.y-2)*squareSize,squareSize,squareSize,"bonus");
            }
            paintSquare((horse.x+1)*squareSize,(horse.y-2)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move.dir == 4) {
            if (move.bonus) {
                showImage((horse.x+2)*squareSize,(horse.y-1)*squareSize,squareSize,squareSize,"bonus");
            }
            paintSquare((horse.x+2)*squareSize,(horse.y-1)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move.dir == 5) {
            if (move.bonus) {
                showImage((horse.x+2)*squareSize,(horse.y+1)*squareSize,squareSize,squareSize,"bonus");
            }
            paintSquare((horse.x+2)*squareSize,(horse.y+1)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move.dir == 6) {
            if (move.bonus) {
                showImage((horse.x+1)*squareSize,(horse.y+2)*squareSize,squareSize,squareSize,"bonus");
            }
            paintSquare((horse.x+1)*squareSize,(horse.y+2)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move.dir == 7) {
            if (move.bonus) {
                showImage((horse.x-1)*squareSize,(horse.y+2)*squareSize,squareSize,squareSize,"bonus");
            }
            paintSquare((horse.x-1)*squareSize,(horse.y+2)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else if (move.dir == 8) {
            if (move.bonus) {
                showImage((horse.x-2)*squareSize,(horse.y+1)*squareSize,squareSize,squareSize,"bonus");
            }
            paintSquare((horse.x-2)*squareSize,(horse.y+1)*squareSize,squareSize,squareSize,"#4adeff");
        }
        else {
            throw `There's an invalid item in movements array: ${move}`;
        }
    }
}

/**
 * Cleans all fields that were supposed to be accessible.
 * @param {Object} horse 
 * @param {Number} id: 1 -> human, 2 -> machine.
 * @param {Object} world 
 */

function cleanAllPossibleMovements(horse, id, world) {
    let possibles = horse.possibleMovements;
    let color = "";
    if (id == 1) {
        color = "#5bfe3e"
    }
    else {
        color = "#fa4b2a"
    }
    while (possibles.length > 0) {
        let move = possibles.pop();        
        if (move.bonus) {
            if (move.x != horse.x || move.y != horse.y) {
                showImage(move.x*squareSize,move.y*squareSize,squareSize,squareSize,"bonus");
                paintSquare(move.x*squareSize,move.y*squareSize,squareSize,squareSize,"#dd9c10");
            }
            else {
                // paint all adjacent fields is our duty this time.
                // up
                if (horse.y-1 >= 0) {
                    if (world[horse.y-1][horse.x] == 0) {
                        paintSquare((horse.x)*squareSize,(horse.y-1)*squareSize,squareSize,squareSize,color);
                        horse.nBoxes ++;
                    }
                }
                // down
                if (horse.y+1 < world.length) {
                    if (world[horse.y+1][horse.x] == 0) {
                        paintSquare((horse.x)*squareSize,(horse.y+1)*squareSize,squareSize,squareSize,color);
                        horse.nBoxes ++;
                    }
                }
                // left
                if (horse.x-1 >= 0) {
                    if (world[horse.y][horse.x-1] == 0) {
                        paintSquare((horse.x-1)*squareSize,(horse.y)*squareSize,squareSize,squareSize,color);
                        horse.nBoxes ++;
                    }
                }
                // right
                if (horse.x+1 < world.length) {
                    if (world[horse.y][horse.x+1] == 0) {
                        paintSquare((horse.x+1)*squareSize,(horse.y)*squareSize,squareSize,squareSize,color);
                        horse.nBoxes ++;
                    }
                }
            }
        }
        else {
            paintSquare(move.x*squareSize,move.y*squareSize,squareSize,squareSize,"white");
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
    // paintPossibleMovements(h1, world);
    // h1.selectedMove = 0;
    // paintSelectedField(h1);
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
 * Paints the selected field by player 1.
 * @param {Object} horse  
 */

function paintSelectedField(horse) {
    let i = horse.selectedMove
    if (horse.possibleMovements[i].bonus) {
        showImage(horse.possibleMovements[i].x*squareSize,horse.possibleMovements[i].y*squareSize,squareSize,squareSize,"bonus")
    }
    paintSquare(horse.possibleMovements[i].x*squareSize,horse.possibleMovements[i].y*squareSize,squareSize,squareSize,"#c1ff7e")
}

/**
 * Turns a horse in a given direction and paints him.
 * @param {Object} horse
 * @param {Number} id: 1 -> human, 2 -> machine.
 */
function moveHorse(horse, id) {
    horse.nBoxes ++;
    let i = horse.selectedMove;
    let newMov = horse.possibleMovements[i];
    if (id == 1) {
        // player 1
        world[horse.y][horse.x] = 4;
        paintSquare(horse.x*squareSize,horse.y*squareSize,squareSize,squareSize,"#5bfe3e")
    }
    else {
        // player 2
        world[horse.y][horse.x] = 3;
        paintSquare(horse.x*squareSize,horse.y*squareSize,squareSize,squareSize,"#fa4b2a")
    }
    horse.x = newMov.x;
    horse.y = newMov.y;
    horse.selectedMove = 0;
    cleanAllPossibleMovements(horse, id, world);
    if (id == 1) {
        world[horse.y][horse.x] = 1;
        paintHorse(horse,"#5bfe3e");
    }
    else{
        world[horse.y][horse.x] = 2;
        paintHorse(horse,"#fa4b2a");
    }
    updateStatistics();
}

/**
 * Keeps updated statistics about the game: number of boxes gained by each player
 * and computing time.
 */

function updateStatistics() {
    // player 1 - boxes
    document.getElementById("expanded_nodes").textContent = `${h1.nBoxes}`;
    // player 2 - boxes
    document.getElementById("tree_depth").textContent = `${h2.nBoxes}`;
    // computing time
    document.getElementById("computing_time").textContent = `${util.truncateDecimals(computingTime,4)} ms`;
}

/**
 * Ends with all the mario's world, when mario losses or wins.
 */

function endGame() {
    // computingTime = Math.abs(endTime-startTime);
    // hide container and show the end screen.
    let endTitle = document.getElementById('end-title');
    let endScreen = document.getElementById('end-screen');
    let container = document.getElementById('container');
    endScreen.style.display = `flex`;
    container.style.display = `none`;
    if (h1.nBoxes > h2.nBoxes) {
        endTitle.textContent = `Player 1 Won!, with ${h2.nBoxes} boxes`;
    }
    else {
        endTitle.textContent = `Player 2 Won!, with ${h2.nBoxes} boxes`;
    }
    // show the statistics too.
    updateStatistics();
}

/**
 * Restarts the mario's game with the same world.
 */

function restartGame() {
    world = util.deep_copy(initWorld);
    makeWorld(world);
    paintWorld(world);
    h1.isTurn = false;
    h1.selectedMove = 0;
    h1.nBoxes = 1;
    h1.possibleMovements = [];
    h2.isTurn = true;
    h2.selectedMove = 0;
    h2.nBoxes = 1;
    h2.possibleMovements = [];
    let endScreen = document.getElementById('end-screen');
    let container = document.getElementById('container');
    endScreen.style.display = `none`;
    container.style.display = `flex`;
    updateStatistics();
    let intervalID = setInterval(() => {
        console.log(`is h2 turn: ${h2.isTurn}`);
        if (h2.isTurn) {
            possibleMovements(h2, world);
            if (h2.possibleMovements.length == 0) {
                clearInterval(intervalID);
                endGame();
            }
            else {
                moveHorse(h2, 2);
                h2.isTurn = false;
                h1.isTurn = true;
                paintPossibleMovements(h1, world);
                if (h1.possibleMovements.length == 0) {
                    clearInterval(intervalID);
                    endGame();
                }
                else{
                    h1.selectedMove = 0;
                    paintSelectedField(h1);
                }
            }            
        }
    }, 1000);
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

    // When machine starts to move
    let intervalID = setInterval(() => {
        console.log(`is h2 turn: ${h2.isTurn}`);
        if (h2.isTurn) {
            possibleMovements(h2, world);
            if (h2.possibleMovements.length == 0) {
                clearInterval(intervalID);
                endGame();
            }
            else {
                moveHorse(h2, 2);
                h2.isTurn = false;
                h1.isTurn = true;
                paintPossibleMovements(h1, world);
                if (h1.possibleMovements.length == 0) {
                    clearInterval(intervalID);
                    endGame();
                }
                else{
                    h1.selectedMove = 0;
                    paintSelectedField(h1);
                }
            }            
        }
    }, 1000)    

    // Button listener
    restartButton.addEventListener('mousedown', () => {
        restartGame();
    })

    // When a mouse button is pressed.
    canvas.addEventListener('mousedown', ( event ) => {        
        if (h1.isTurn) { 
            moveHorse(h1, 1);
            h1.isTurn = false;
            h2.isTurn = true;
            console.log(world);
        }
    });

    // Logic to manage mouse movement.
    canvas.addEventListener('mousemove', ( event ) => {
        if (h1.isTurn) {
            cursor.x = event.pageX;
            cursor.y = event.pageY;
            let i = h1.selectedMove;
            let scale = 3;
            // up - left
            if (cursor.y == cursor.prevY - scale || cursor.x == cursor.prevX - scale) {
                paintSquare(h1.possibleMovements[i].x*squareSize,h1.possibleMovements[i].y*squareSize,squareSize,squareSize,"#4adeff");
                if (h1.possibleMovements[i].bonus) {
                    showImage(h1.possibleMovements[i].x*squareSize,h1.possibleMovements[i].y*squareSize,squareSize,squareSize,"bonus")
                }
                if (i == 0) {
                    h1.selectedMove = h1.possibleMovements.length - 1;
                } 
                else {
                    h1.selectedMove -= 1;
                }
                paintSelectedField(h1);
            }
            // down - right
            else if (cursor.y == cursor.prevY + scale || cursor.x == cursor.prevX + scale) {
                paintSquare(h1.possibleMovements[i].x*squareSize,h1.possibleMovements[i].y*squareSize,squareSize,squareSize,"#4adeff");
                if (h1.possibleMovements[i].bonus) {
                    showImage(h1.possibleMovements[i].x*squareSize,h1.possibleMovements[i].y*squareSize,squareSize,squareSize,"bonus")
                }
                if (i == h1.possibleMovements.length - 1) {
                    h1.selectedMove = 0;
                } 
                else {
                    h1.selectedMove += 1;
                }
                paintSelectedField(h1);
            }
            cursor.prevX = event.pageX;
            cursor.prevY = event.pageY;
        }
    });

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
