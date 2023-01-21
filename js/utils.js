//====================================================================================
// This module is useful to declare and export generic functions or classes
//====================================================================================

//------------------------------------------------------------------------------------
// Classes
//------------------------------------------------------------------------------------

/**
 * Class node
 * @param {matix} map
 * @param {Node} father
 * @param {string} operator
 * @param {int} pos_x_mario
 * @param {int} pos_y_mario
 */
 export class Node {

    constructor(map, father, operator, costo, pos_x_mario, pos_y_mario) {
      this.map = map;
      this.father = father;
      this.operator = operator;
      this.costo = costo;
      this.pos_x_mario = pos_x_mario;
      this.pos_y_mario = pos_y_mario;
    }
  
    // Methods
    showMap() {
      // console.log(this.map);
      return this.map;
    }
  
    showFather() {
      // console.log(this.father);
      return this.father;
    }
  
    showOperator() {
      // console.log(this.operator);
      return this.operator;
    }
  
    showCosto() {
      // console.log(this.costo);
      return this.costo;
    }
  
    showPosXMario() {
      // console.log(this.pos_x_mario);
      return this.pos_x_mario;
    }
  
    showPosYMario() {
      // console.log(this.pos_y_mario);
      return this.pos_y_mario;
    }
  
  }

//------------------------------------------------------------------------------------
// Functions
//------------------------------------------------------------------------------------

/**
 * sleeps the program while is executing with a given delay in miliseconds.
 * @param {Number} delay 
 */

export function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

/**
 * Makes a deep copy of an object. 
 * A deep copy of an object is a copy whose properties do not share the same references.
 * @param {Object} object 
 * @returns 
 */

export function deep_copy(object) {
    if (typeof(object) == "number") return object + 0;
    return JSON.parse(JSON.stringify(object));
}

/**
 * Returns a ramdom number in interval [a,b].
 * @param {Number} a 
 * @param {Number} b 
 * @returns 
 */
export function random_between_a_b(a,b) {
    return Math.floor(Math.random() * (b - a + 1) + a)
}

/**
 * Determines if two lists or objects are equal.
 * @param {Object} o1 
 * @param {Object} o2 
 */
export function areEqual(o1, o2) {
    return JSON.stringify(o1) === JSON.stringify(o2);
}

/**
 * Calculates the manhattan distance between an object "a" regarding an object "b".
 * @param {Object} a {posx: ..., posy: ...} 
 * @param {Object} b {posx: ..., posy: ...}
 */

export function manhattanDist(a, b) {
    return Math.abs(a.posx-b.posx) + Math.abs(a.posy-b.posy);
}

/**
 * Calculates the euclidian distance between an object "a" regarding an object "b".
 * @param {Object} a {posx: ..., posy: ...} 
 * @param {Object} b {posx: ..., posy: ...}
 */

export function euclidianDistance(a, b){
    return Math.sqrt(Math.pow(a.posx-b.posx,2)+Math.pow(a.posy-b.posy,2));
}

/**
 * Determines the heuristic's structure for our minimax algorithm.
 * @param {Object} horse1
 * @param {Object} horse2
 */

 export function calcHeuristic(node){
  return (node.horse2.nBoxes - node.horse1.nBoxes) + (node.horse2.nextMoves.length);
}

/**
 * Gets the real mouse position from canvas. (THERE'RE PROBLEMS WITH RETURNED COORDINATES).
 * @param {*} canvas 
 * @param {*} evt 
 * @returns 
 */

export function  getMousePos(canvas, evt, scale) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

  return {
    x: ((evt.pageX - rect.left) * scaleX),   // scale mouse coordinates after they have
    y: ((evt.pageY - rect.top) * scaleY)     // been adjusted to be relative to element
  }
}

/**
 * Finds and retrieves an existing element in a list.
 * @param {*} e 
 * @param {List} list 
 */

export function getElement(e, list){
  for (let i = 0; i < list.length; i++) {
    if(e == list[i]) {
      return e;
    }
  }
  throw `the element ${e} doesn't exist in the list ${list}`
}

/**
 * Checks if a point is inside a rectangle;
 * @param {Object} point
 * @param {Object} rect 
 */

export function overlapsRect(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y <= rect.y + rect.height && point.y >= rect.y;
}

/**
 * Converts the given solution in a list readable for mario to start moving.
 * @param {Object} sol 
 */
export function convertSolutionToList(sol) {
    let solution = [];
    let limit = sol.depth - 1
    for(let i = 0; i < limit; i++) {
        solution.push(sol.dir)
        sol = sol.parent;
    }
    return solution.reverse();
}

/**
 * Truncates a given number into a certain number of decimals, i.e. (1.4245, 2) -> 1.42.
 * @param {Number} n number 
 * @param {Number} d number of decimals to truncate
 * @returns 
 */
export function truncateDecimals(n, d) {
    return Math.floor(n * Math.pow(10,d)) / Math.pow(10,d);
}