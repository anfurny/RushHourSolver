/**
 * Created by Alex on 12/23/15.
 */

var genericSearcher = require ("./genericSearch.js");

var thePuzzle =
        "2333 4" +
        "2556 4" +
        "11 6 4" +
        "7789  " +
        "  89AA" +
        " BBCC ";

var somePuzzle = FA(thePuzzle.split("")).chunk(6);

var add = function(coord1, coord2) {
    return [coord1[0]+coord2[0], coord1[1]+coord2[1]];
}

var winCondition = function(puzzleState) {
    return isVehicle(getValueOfSpace(puzzleState,[5,2])) === 1;
};

var enumerateValidMoves = function (puzzle) {
    var vehicles = getVehicles(puzzle);
    var validMoves = vehicles.map(function(vehicle){
        return [canGoForward(puzzle, vehicle), canGoBackward(puzzle, vehicle)];
    });
    return _.filter(_.flatten(validMoves));
};

var canGoForward = function(puzzle, vehicle) {
    // forward = right or down
    if (vehicle.orientation === 'ver'){
        if  (isSpaceOpen(puzzle, [vehicle.leftX, vehicle.topY + vehicle.size] ))
            return {direction: 'down', vehicle: vehicle};
    }
    else
    {
        if (isSpaceOpen(puzzle, [vehicle.leftX + vehicle.size , vehicle.topY]))
            return {direction: 'right', vehicle: vehicle};
    }
    return false;
};

var canGoBackward = function(puzzle, vehicle) {
    // backward = left or up
    if (vehicle.orientation === 'ver') {
        if (isSpaceOpen(puzzle, [vehicle.leftX, vehicle.topY - 1]))
            return {direction: 'up', vehicle: vehicle};
    }  else {
        if (isSpaceOpen(puzzle, [vehicle.leftX - 1, vehicle.topY])){
            return {direction: 'left', vehicle: vehicle};
        }
    }
    return false;
};

var applyMove = function(puzzleOriginal, move ) {
    const newPuzzle = puzzleOriginal.slice().map(".slice()");
    const directions = {'up': [0, -1], 'down': [0, 1], 'left': [-1, 0], 'right': [1, 0]};
    const size = move.vehicle.size, leftX = move.vehicle.leftX, topY = move.vehicle.topY;

    const vehicleTop = [leftX, topY];
    const vehicleBottom = [leftX, topY + size - 1];
    const vehicleLeft = vehicleTop;
    const vehicleRight = [leftX + size - 1, topY];

    const replacers = {'up': [vehicleTop, vehicleBottom], 'down': [vehicleBottom, vehicleTop], left: [vehicleLeft, vehicleRight], right:[vehicleRight, vehicleLeft]};

    setValueOfSpace(newPuzzle, replacers[move.direction][1], " ");
    setValueOfSpace(newPuzzle, add(directions[move.direction], replacers[move.direction][0]), move.vehicle.label);

    return newPuzzle;
}

var isSpaceOpen = function(puzzle, coord){
    return getValueOfSpace(puzzle, coord) === ' ';
};

var getValueOfSpace = function(puzzle, coord) {
    const [x,y]  = coord;
    if (puzzle.hasOwnProperty(y) && puzzle[y].hasOwnProperty(x))
        return puzzle[y][x];
    return "X";
};

var setValueOfSpace = function(puzzle,coord, value){
    const [x,y]  = coord;
    puzzle[y][x] = value;
}

var getVehicles = function(puzzleOriginal) {
    var puzzle = puzzleOriginal.slice().map(".slice()");
    var vehicles = [];
    for (var y=0; y < puzzle.length; y++)
        for(var x =0; x < puzzle.length; x++)
            vehicles.push(findVehicleAt(puzzle, [x, y]));
    return vehicles.filter(_.identity);
};

var isVehicle = function(char){
    return "123456789ABCDEFGHIJ".indexOf(char) + 1;
};

var toString = function(puzzle) {
    return "\n" + puzzle.map(".join('')").join("\n");
};

var findVehicleAt = function(puzzle, coord) {
    const [x,y]  = coord;

    var value = (getValueOfSpace(puzzle, coord));
    if (isVehicle(value)) {
        for (var i = 1; getValueOfSpace(puzzle, [x+i, y]) == value; i++) {
            setValueOfSpace(puzzle, [x+i,y],' ');
        };
        var rightSize = i;
        for (var i = 1; getValueOfSpace(puzzle, [x, y+i]) == value; i++) {
            setValueOfSpace(puzzle,[x,y+i],' ');
        };
        var downSize = i;
        setValueOfSpace(puzzle,[x,y],' ');

        return {'orientation': rightSize > downSize ? "hor" : "ver", size: Math.max(rightSize, downSize), id: isVehicle(value), label: value, topY: y, leftX: x};
    } else {
        return false;
    }
};


var solver = new genericSearcher(somePuzzle, enumerateValidMoves, applyMove, winCondition, JSON.stringify);
solver.findSolution(function(sol){
    console.log("Solution found" /* sol */);
    return true;
}, 1000);