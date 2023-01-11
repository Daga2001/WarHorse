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

//Difficulty
let depth = 2;
let difficulty = localStorage.getItem('difficulty');
if (difficulty == '1') {
    depth = 2;
}
else if (difficulty == '2') {
    depth = 4;
}
else if (difficulty == '3') {
    depth = 6;
}

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

let initWorld = util.deep_copy(world);

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
    parent: null,
    x: 0,
    y: 0,
    depth: 0,
    stack: [],
    type: "MAX",
    val: -Infinity,
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
 * @param {Number} id_horse 
 * @param {Object} world
 * @returns List
 */

function possibleMovements(id_horse, world) {
    let movements = [];
    let horse = {};
    if(typeof(id_horse) == "number") {
        if (id_horse == 1) horse = h1;
        else if (id_horse == 2) horse = h2;
    }
    else if (typeof(id_horse) == "object") {
        horse = id_horse;
    }
    // 1
    if (horse.x-2 >= 0 && horse.y-1 >= 0 && (world[horse.y-1][horse.x-2] == 0 || world[horse.y-1][horse.x-2] == 5)) {
        movements.push(1);
        horse.possibleMovements.push({ x: horse.x-2, y: horse.y-1, bonus: world[horse.y-1][horse.x-2] == 5, dir: 1});
    }
    // 2
    if (horse.x-1 >= 0 && horse.y-2 >= 0 && (world[horse.y-2][horse.x-1] == 0 || world[horse.y-2][horse.x-1] == 5)) {
        movements.push(2);
        horse.possibleMovements.push({ x: horse.x-1, y: horse.y-2, bonus: world[horse.y-2][horse.x-1] == 5, dir: 2});
    }
    // 3
    if (horse.x+1 < world.length && horse.y-2 >= 0 && (world[horse.y-2][horse.x+1] == 0 || world[horse.y-2][horse.x+1] == 5)) {
        movements.push(3);
        horse.possibleMovements.push({ x: horse.x+1, y: horse.y-2, bonus: world[horse.y-2][horse.x+1] == 5, dir: 3});
    }
    // 4
    if (horse.x+2 < world.length && horse.y-1 >= 0 && (world[horse.y-1][horse.x+2] == 0 || world[horse.y-1][horse.x+2] == 5)) {
        movements.push(4);
        horse.possibleMovements.push({ x: horse.x+2, y: horse.y-1, bonus: world[horse.y-1][horse.x+2] == 5, dir: 4});
    }
    // 5
    if (horse.x+2 < world.length && horse.y+1 < world.length && (world[horse.y+1][horse.x+2] == 0 || world[horse.y+1][horse.x+2] == 5)) {
        movements.push(5);
        horse.possibleMovements.push({ x: horse.x+2, y: horse.y+1, bonus: world[horse.y+1][horse.x+2] == 5, dir: 5});
    }
    // 6
    if (horse.x+1 < world.length && horse.y+2 < world.length && (world[horse.y+2][horse.x+1] == 0 || world[horse.y+2][horse.x+1] == 5)) {
        movements.push(6);
        horse.possibleMovements.push({ x: horse.x+1, y: horse.y+2, bonus: world[horse.y+2][horse.x+1] == 5, dir: 6});
    }
    // 7
    if (horse.x-1 >= 0 && horse.y+2 < world.length && (world[horse.y+2][horse.x-1] == 0 || world[horse.y+2][horse.x-1] == 5)) {
        movements.push(7);
        horse.possibleMovements.push({ x: horse.x-1, y: horse.y+2, bonus: world[horse.y+2][horse.x-1] == 5, dir: 7});
    }
    // 8
    if (horse.x-2 >= 0 && horse.y+1 < world.length && (world[horse.y+1][horse.x-2] == 0 || world[horse.y+1][horse.x-2] == 5)) {
        movements.push(8);
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
 * @param {Number} id_horse 
 * @param {Object} world 
 */

function paintPossibleMovements(id_horse, world) {
    possibleMovements(id_horse, world);
    let horse = {};
    if(typeof(id_horse) == "number") {
        if (id_horse == 1) horse = h1;
        else if (id_horse == 2) horse = h2;
    }
    else if (typeof(id_horse) == "object") {
        horse = id_horse;
    }
    let movements = util.deep_copy(horse).possibleMovements;
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
 * @param {Number} id_horse  
 */

function paintSelectedField(id_horse) {
    let horse = {};
    if(typeof(id_horse) == "number") {
        if (id_horse == 1) horse = h1;
        else if (id_horse == 2) horse = h2;
    }
    else if (typeof(id_horse) == "object") {
        horse = id_horse;
    }
    let i = horse.selectedMove
    if (horse.possibleMovements[i].bonus) {
        showImage(horse.possibleMovements[i].x*squareSize,horse.possibleMovements[i].y*squareSize,squareSize,squareSize,"bonus")
    }
    paintSquare(horse.possibleMovements[i].x*squareSize,horse.possibleMovements[i].y*squareSize,squareSize,squareSize,"#c1ff7e")
}

/**
 * Turns a horse in a given direction and paints him.
 * @param {Number} id: 1 -> human, 2 -> machine.
 */
function moveHorse(id) {
    let horse = {};
    if (id == 1) horse = h1;
    else if (id == 2) horse = h2;
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
    startGame();
}

/**
 * Returns a value which represents a choise using minimax algorithm.
 * NOTE: this is a non-generic version of minimax algorithm.
 * @param {Object} initNode 
 * @param {Number} depth 
 * @param {Number} id_init_horse
 */

export function minimax(initNode, depth, id_init_horse) {
    let horse1 = util.deep_copy(h1);
    let horse2 = util.deep_copy(h2);

    /**
     * Builds up the initial tree, without evaluating leaf nodes.
     */

    let buildTree = function (queue, tree) {

        /**
         * Determines which node must be expanded.
         * @param {List} stack
         */

        let nextNode = function(stack) {
            return stack.shift();
        }
    
        let body = function (parent, childrenType, horse, utility, h_id, field) {
            let i_children = [];
            let move = 0;
            let evalBoxes = function (h, node) {
                if (node[h.y][h.x] == 5) {
                    // up
                    if (h.y-1 >= 0) {
                        if (node[h.y-1][h.x] == 0) {
                            h.nBoxes ++;
                        }
                    }
                    // down
                    if (h.y+1 < node.length) {
                        if (node[h.y+1][h.x] == 0) {
                            h.nBoxes ++;
                        }
                    }
                    // left
                    if (h.x-1 >= 0) {
                        if (node[h.y][h.x-1] == 0) {
                            h.nBoxes ++;
                        }
                    }
                    // right
                    if (h.x+1 < node.length) {
                        if (node[h.y][h.x+1] == 0) {
                            h.nBoxes ++;
                        }
                    }
                }
                else {
                    h.nBoxes += 1;
                }
            }
            let possibles = possibleMovements(horse, parent.structure);
    
            // 1
            if (possibles.includes(1)) {
                c++;
                i_children.push(c);
                let h = util.deep_copy(horse);
                let node = util.deep_copy(parent.structure);
                node[h.y][h.x] = field;
                h.y -= 1;
                h.x -= 2;
                evalBoxes(h, node);
                h.selectedMove = move;
                move++;
                node[h.y][h.x] = h_id;
                let newNode = { 
                        id: util.deep_copy(c),
                        parent: parent,
                        children: null,
                        type: childrenType, 
                        depth: parent.depth + 1, 
                        val: utility, 
                        structure: util.deep_copy(node),
                        horse1: util.deep_copy(parent.horse1),
                        horse2: util.deep_copy(parent.horse2),
                        id_horse: h_id,
                    };
                if (h_id == 1) {
                    newNode.horse1 = util.deep_copy(h);
                }
                else if (h_id == 2) {
                    newNode.horse2 = util.deep_copy(h);
                }
                // evaluates leaf nodes.
                if(parent.depth + 1 == depth ) {
                    newNode.val = util.calcHeuristic(newNode.horse1, newNode.horse2);
                }
                queue.push(newNode);
                tree.push(newNode);
            }
            // 2
            if (possibles.includes(2)) {
                c++;
                i_children.push(c);
                let h = util.deep_copy(horse);
                let node = util.deep_copy(parent.structure);
                node[h.y][h.x] = field;
                h.y -= 2;
                h.x -= 1; 
                evalBoxes(h, node);
                h.selectedMove = move;
                move++;
                node[h.y][h.x] = h_id;
                let newNode = { 
                        id: util.deep_copy(c),
                        parent: parent,
                        children: null, 
                        type: childrenType, 
                        depth: parent.depth + 1, 
                        val: utility, 
                        structure: util.deep_copy(node),
                        horse1: util.deep_copy(parent.horse1),
                        horse2: util.deep_copy(parent.horse2),
                        id_horse: h_id,
                    };
                if (h_id == 1) {
                    newNode.horse1 = util.deep_copy(h);
                }
                else if (h_id == 2) {
                    newNode.horse2 = util.deep_copy(h);
                }
                // evaluates leaf nodes.
                if(parent.depth + 1 == depth ) {
                    newNode.val = util.calcHeuristic(newNode.horse1, newNode.horse2);
                }
                queue.push(newNode);
                tree.push(newNode);
            }
            // 3
            if (possibles.includes(3)) {
                c++;
                i_children.push(c);
                let h = util.deep_copy(horse);
                let node = util.deep_copy(parent.structure);
                node[h.y][h.x] = field;
                h.y -= 2;
                h.x += 1; 
                evalBoxes(h, node);
                h.selectedMove = move;
                move++;
                node[h.y][h.x] = h_id;
                let newNode = { 
                        id: util.deep_copy(c),
                        parent: parent, 
                        children: null,
                        type: childrenType, 
                        depth: parent.depth + 1, 
                        val: utility, 
                        structure: util.deep_copy(node),
                        horse1: util.deep_copy(parent.horse1),
                        horse2: util.deep_copy(parent.horse2),
                        id_horse: h_id,
                    };
                if (h_id == 1) {
                    newNode.horse1 = util.deep_copy(h);
                }
                else if (h_id == 2) {
                    newNode.horse2 = util.deep_copy(h);
                }
                // evaluates leaf nodes.
                if(parent.depth + 1 == depth ) {
                    newNode.val = util.calcHeuristic(newNode.horse1, newNode.horse2);
                }
                queue.push(newNode);
                tree.push(newNode);
            }
            // 4
            if (possibles.includes(4)) {
                c++;
                i_children.push(c);
                let h = util.deep_copy(horse);
                let node = util.deep_copy(parent.structure);
                node[h.y][h.x] = field;
                h.y -= 1;
                h.x += 2; 
                evalBoxes(h, node);
                h.selectedMove = move;
                move++;
                node[h.y][h.x] = h_id;
                let newNode = { 
                        id: util.deep_copy(c),
                        parent: parent, 
                        children: null,
                        type: childrenType, 
                        depth: parent.depth + 1, 
                        val: utility, 
                        structure: util.deep_copy(node),
                        horse1: util.deep_copy(parent.horse1),
                        horse2: util.deep_copy(parent.horse2),
                        id_horse: h_id,
                    };
                if (h_id == 1) {
                    newNode.horse1 = util.deep_copy(h);
                }
                else if (h_id == 2) {
                    newNode.horse2 = util.deep_copy(h);
                }
                // evaluates leaf nodes.
                if(parent.depth + 1 == depth ) {
                    newNode.val = util.calcHeuristic(newNode.horse1, newNode.horse2);
                }
                queue.push(newNode);
                tree.push(newNode);
            }
            // 5
            if (possibles.includes(5)) {
                c++;
                i_children.push(c);
                let h = util.deep_copy(horse);
                let node = util.deep_copy(parent.structure);
                node[h.y][h.x] = field;
                h.y += 1;
                h.x += 2; 
                evalBoxes(h, node);
                h.selectedMove = move;
                move++;
                node[h.y][h.x] = h_id;
                let newNode = { 
                        id: util.deep_copy(c),
                        parent: parent, 
                        children: null,
                        type: childrenType, 
                        depth: parent.depth + 1, 
                        val: utility, 
                        structure: util.deep_copy(node),
                        horse1: util.deep_copy(parent.horse1),
                        horse2: util.deep_copy(parent.horse2),
                        id_horse: h_id,
                    };
                if (h_id == 1) {
                    newNode.horse1 = util.deep_copy(h);
                }
                else if (h_id == 2) {
                    newNode.horse2 = util.deep_copy(h);
                }
                // evaluates leaf nodes.
                if(parent.depth + 1 == depth ) {
                    newNode.val = util.calcHeuristic(newNode.horse1, newNode.horse2);
                }
                queue.push(newNode);
                tree.push(newNode);
            }
            // 6
            if (possibles.includes(6)) {
                c++;
                i_children.push(c);
                let h = util.deep_copy(horse);
                let node = util.deep_copy(parent.structure);
                node[h.y][h.x] = field;
                h.y += 2;
                h.x += 1; 
                evalBoxes(h, node);
                h.selectedMove = move;
                move++;
                node[h.y][h.x] = h_id;
                let newNode = { 
                        id: util.deep_copy(c),
                        parent: parent,
                        children: null, 
                        type: childrenType, 
                        depth: parent.depth + 1, 
                        val: utility, 
                        structure: util.deep_copy(node),
                        horse1: util.deep_copy(parent.horse1),
                        horse2: util.deep_copy(parent.horse2),
                        id_horse: h_id,
                    };
                if (h_id == 1) {
                    newNode.horse1 = util.deep_copy(h);
                }
                else if (h_id == 2) {
                    newNode.horse2 = util.deep_copy(h);
                }
                // evaluates leaf nodes.
                if(parent.depth + 1 == depth ) {
                    newNode.val = util.calcHeuristic(newNode.horse1, newNode.horse2);
                }
                queue.push(newNode);
                tree.push(newNode);
            }
            // 7
            if (possibles.includes(7)) {
                c++;
                i_children.push(c);
                let h = util.deep_copy(horse);
                let node = util.deep_copy(parent.structure);
                node[h.y][h.x] = field;
                h.y += 2;
                h.x -= 1; 
                evalBoxes(h, node);
                h.selectedMove = move;
                move++;
                node[h.y][h.x] = h_id;
                let newNode = { 
                        id: util.deep_copy(c),
                        parent: parent, 
                        children: null,
                        type: childrenType, 
                        depth: parent.depth + 1, 
                        val: utility, 
                        structure: util.deep_copy(node),
                        horse1: util.deep_copy(parent.horse1),
                        horse2: util.deep_copy(parent.horse2),
                        id_horse: h_id,
                    };
                if (h_id == 1) {
                    newNode.horse1 = util.deep_copy(h);
                }
                else if (h_id == 2) {
                    newNode.horse2 = util.deep_copy(h);
                }
                // evaluates leaf nodes.
                if(parent.depth + 1 == depth ) {
                    newNode.val = util.calcHeuristic(newNode.horse1, newNode.horse2);
                }
                queue.push(newNode);
                tree.push(newNode);
            }
            // 8
            if (possibles.includes(8)) {
                c++;
                i_children.push(c);
                let h = util.deep_copy(horse);
                let node = util.deep_copy(parent.structure);
                node[h.y][h.x] = field;
                h.y += 1;
                h.x -= 2; 
                evalBoxes(h, node);
                h.selectedMove = move;
                move++;
                node[h.y][h.x] = h_id;
                let newNode = { 
                        id: util.deep_copy(c),
                        parent: parent, 
                        children: null,
                        type: childrenType, 
                        depth: parent.depth + 1, 
                        val: utility, 
                        structure: util.deep_copy(node),
                        horse1: util.deep_copy(parent.horse1),
                        horse2: util.deep_copy(parent.horse2),
                        id_horse: h_id,
                    };
                if (h_id == 1) {
                    newNode.horse1 = util.deep_copy(h);
                }
                else if (h_id == 2) {
                    newNode.horse2 = util.deep_copy(h);
                }
                // evaluates leaf nodes.
                if(parent.depth + 1 == depth ) {
                    newNode.val = util.calcHeuristic(newNode.horse1, newNode.horse2);
                }
                queue.push(newNode);
                tree.push(newNode);
            }
            parent.children = i_children;
        }
    
        // --------------------------------------------------------------
        // starting up with inital values
        // --------------------------------------------------------------

        // Parent node --> MAX
        let parent = { 
            id: 0,
            parent: null,
            children: null, 
            type: "MAX", 
            depth: 0, 
            val: -Infinity, 
            structure: util.deep_copy(initNode),
            horse1: util.deep_copy(horse1),
            horse2: util.deep_copy(horse2),
            id_horse: id_init_horse, // id of last horse which moved.
            }
        tree.push(parent);

        // counter to reference children indexes.
        let c = 0;
    
        let childrenType = "MIN";
        let h = util.deep_copy(parent.horse2);
        let utility = Infinity;
        let h_id = 2;
        let field = 3;
        
        body(parent, childrenType, h, utility, h_id, field);

        // --------------------------------------------------------------
        // while loop to expand nodes
        // --------------------------------------------------------------
        let k = 0;
        let initBacktrackIndex = 0;
        let backtrackSaved = false;
        while(queue.length > 0) {
            k++;
            let parent = nextNode(queue);
            let childrenType = "";
            let h = {};
            let utility = 0;
            let h_id = 0;
            let field = 0;
    
            if (parent.type == "MAX") {
                childrenType = "MIN";
                h = util.deep_copy(parent.horse2);
                utility = Infinity;
                h_id = 2;
                field = 3;
            }
            else if (parent.type == "MIN") {
                childrenType = "MAX";
                h = util.deep_copy(parent.horse1);
                utility = -Infinity;
                h_id = 1;
                field = 4;
            }

            if(parent.depth == depth && !backtrackSaved) {
                initBacktrackIndex = k;
                backtrackSaved = true;
            }
    
            if (parent.depth < depth) {
                body(parent, childrenType, h, utility, h_id, field);
            }
        }
        return initBacktrackIndex;
    }    

    /**
     * Backtracks the tree from the leaf to the parent nodes.
     * @param {List} tree 
     * @param {Number} i index where the pointer begins the trace in tree.
     */

    let backtrackTree = function (tree) {

        /**
         * The recursive body of minimax algorithm.
         * @param {Number} i_node index of current node 
         * @param {*} a 
         * @param {*} b 
         */

        let recursiveBody = function (i_node) {
            let node = tree[i_node];
            let parent = node.parent;

            if (node.children == null) {
                return node;
            }
            else if (node.type == "MAX") {
                for(let i = 0; i < node.children.length; i++) {
                    let i_child = node.children[i];
                    node.val = Math.max(node.val, recursiveBody(i_child).val);
                    if(parent != null) {
                        // if(parent.val == Infinity) parent.val = util.deep_copy(node).val;
                        if(parent.val <= node.val) {
                            break;
                        }
                    }
                }
                return node;
            }
            else if (node.type == "MIN") {
                for(let i = 0; i < node.children.length; i++) {
                    let i_child = node.children[i];
                    node.val = Math.min(node.val, recursiveBody(i_child).val);
                    if(parent != null) {
                        // if(parent.val == -Infinity) parent.val = util.deep_copy(node).val;
                        if(node.val <= parent.val) {
                            break;
                        }
                    }
                }
                return node;
            }
        }

        // --------------------------------------------------------------
        // recursive body
        // --------------------------------------------------------------

        let res = recursiveBody(0);

        return res;
    }

    /**
     * Picks the minimax's choice according the rootNode's children values.
     * @param {Object} rootNode 
     */

    let pickSolution = function(rootNode) {
        if (rootNode.children == null) return null;
        if (rootNode.children.length == 0) return null;
        let best = rootNode.children[0];
        for(let i = 1; i < rootNode.children.length; i++) {
            if (best < rootNode.children[i]) {
                best = rootNode.children[i]
            }
        }
        let node = tree[best];
        h2.possibleMovements = node.horse2.possibleMovements;
        return node.horse2.selectedMove;
    }

    // ==============================================================
    // 1. Tree Building.
    // 2. Evaluating the scores for the leaf nodes based on the evaluation function.
    // ==============================================================
    
    let queue = [];
    let tree = [];

    let initBacktrackIndex = buildTree(queue, tree);

    // ==============================================================
    // 3. Backtracking from the leaf to the root nodes.
    // ==============================================================
    
    let rootNode = backtrackTree(tree);

    // ==============================================================
    // 4. At the root node, choose the node with the maximum value 
    // and select the respective move.
    // ==============================================================

    let choice = pickSolution(rootNode);
    return choice;
  }

/**
 * starts the game.
 */

function startGame() {
    let intervalID = setInterval(() => {
        if (h2.isTurn) {
            h2.selectedMove = minimax(world, depth, 2);
            if (h2.selectedMove == null) {
                if (h1.possibleMovements.length == 0) {
                    clearInterval(intervalID);
                    endGame();
                }
                else {
                    h2.isTurn = false;
                    h1.isTurn = true;
                    paintPossibleMovements(1, world);
                    if (h1.possibleMovements.length == 0) {
                        if (h2.selectedMove == null) {
                            clearInterval(intervalID);
                            endGame();
                        }
                    }
                    else{
                        h1.selectedMove = 0;
                        paintSelectedField(1);
                    }
                }
            }
            else {
                moveHorse(2);
                h2.isTurn = false;
                h1.isTurn = true;
                paintPossibleMovements(1, world);
                if (h1.possibleMovements.length == 0) {
                    h2.isTurn = true;
                    h1.isTurn = false;
                }
                else{
                    h1.selectedMove = 0;
                    paintSelectedField(1);
                }
            }            
        }
    }, 1000);
}

//====================================================================================
// logical structure
//====================================================================================

// try{
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
    
    // When the machine starts to move
    startGame();

    // Button listener
    restartButton.addEventListener('mousedown', () => {
        restartGame();
    })

    // When a mouse button is pressed.
    canvas.addEventListener('mousedown', ( event ) => {        
        if (h1.isTurn) { 
            moveHorse(1);
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
                paintSelectedField(1);
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
                paintSelectedField(1);
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
// }
// catch(e) {
//     console.error(`An error has occurred during game's execution: ${e}`);
// }
