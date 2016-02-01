/**
 * Created by Alex on 12/20/15.
 */
'use strict';

var genericSearcher = function(initialState, getStateNeighbors, applyMove, endCondition, stateToString) {
    this.initialState = initialState;
    this.getStateNeighbors = getStateNeighbors;
    this.applyMove  = applyMove;
    this.endCondition = endCondition;
    this.cache = [];
    this.queue = [];
    this.stateToString = stateToString;
};

genericSearcher.prototype.iterate = function(currentState, previousMoveHistory) {
        var moveHistory = previousMoveHistory || [];
        var self = this;

        var puzzleSummary = this.stateToString(currentState);
        if (this.cache.hasOwnProperty(puzzleSummary)){
            return false;
        }
        this.cache[puzzleSummary] = [moveHistory]; //attempting to solve

        if (this.endCondition(currentState)) {
            return moveHistory;
        }
        var moves = this.getStateNeighbors(currentState);

        var possibleNextStates = moves.map( function(possibleMove) {
                return {state: self.applyMove(currentState, possibleMove), move: possibleMove};
            }
        );

        this.queue = this.queue.concat(possibleNextStates.map(function(possibility) {
            return function() {
                return self.iterate(possibility.state, moveHistory.concat(possibility.state) );
            }
        }));
    };

/**
 *
 * @returns {*}
 */
genericSearcher.prototype.findSolution = function( resolve, maxExecutes = false) {
    var self = this;
    if (maxExecutes === 0) {
        throw "Invalid maxExecutes value";
    }
    if (this.queue.length)
        throw "Job already running";
    this.queue.push(function() { return self.iterate(self.initialState, false, true); });

    //return new Promise(function(resolve, reject){
        self.consumeQueue(resolve, maxExecutes);
    // });
};


/**
 *
 * @param maxExecutes
 * @returns {*}
 */
genericSearcher.prototype.consumeQueue = function (done, maxExecutes = 1000){
    var self = this;

    var oneCycle = function() {
        return (self.queue.shift())();
    }

    for (var i = maxExecutes; i !== 0; i--) {
        if (!self.queue.length){
           return;
        }
        const success = oneCycle();
        if (success) {
            if (done( success)) {
                return;
            }
        }
    }

    setTimeout(this.consumeQueue.bind(this, done, maxExecutes), 0);
};

module.exports = (genericSearcher);