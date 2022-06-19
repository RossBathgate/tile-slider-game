/*
    Developed by Ross Bathgate, June 2022
    Uses the p5.js library
    The code in this file is not intended to be run directly, it is purely a demonstration of the code written using the p5.js editor.
*/

let tiles = [];
let boardModel = [];
const nrTilesInRow = 4;
const canvasWidth = 500;
const tileWidth = canvasWidth / nrTilesInRow;
const difficulty = 200; // controls the number of permutations which "shuffle" the board
let isUserMoving = false;
let prevMouseX = 0;
let prevMouseY = 0;
let prevTileX = 0;
let prevTileY = 0;
let selectedTile = null;
let mouseAlreadyPressed = false;
let hasWon = false;

function setup() {
    createCanvas(canvasWidth, canvasWidth);
    hasWon = false;

    // Populate the tiles array with 25 tile objects initially
    for (let i = 0; i < nrTilesInRow; i++) {
        let modelCol = [];
        for (let j = 0; j < nrTilesInRow; j++) {
            // tiles.push(new Tile(i+nrTilesInRow*j+1, i*tileWidth+tileWidth/2, j*tileWidth+tileWidth/2, tileWidth));
            tiles.push(new Tile(i + nrTilesInRow * j + 1, 0, 0, tileWidth));
            modelCol.push(i + nrTilesInRow * j + 1);
        }
        boardModel.push(modelCol);
    }

    // Create a space in the bottom-right corner
    tiles[nrTilesInRow * nrTilesInRow - 1] = null;
    boardModel[nrTilesInRow - 1][nrTilesInRow - 1] = null;

    // Perform a random number of random permuations
    const nrPermutations = Math.floor(Math.random() * difficulty);
    console.log("Number of starting permutations: " + nrPermutations);
    for (let i = 0; i < nrPermutations; i++) {
        randomPermutation();
    }

    // Set the correct coords for each tile
    for (let i = 0; i < nrTilesInRow; i++) {
        for (let j = 0; j < nrTilesInRow; j++) {
            if (tiles[i + nrTilesInRow * j] !== null) {
                tiles[i + nrTilesInRow * j].x = j * tileWidth + tileWidth / 2;
                tiles[i + nrTilesInRow * j].y = i * tileWidth + tileWidth / 2;
            }
        }
    }
}

// select or deselect the appropraite tile on mouse press.
function mousePressed() {
    if (isUserMoving) {
        const droppedRowNr = getDroppedRowNr();
        const droppedColNr = getDroppedColNr();
        const currentColNr = boardModel.indexOf(
            boardModel.find((col) => col.includes(selectedTile.index))
        );
        const currentRowNr = boardModel[currentColNr].indexOf(
            selectedTile.index
        );

        boardModel[currentColNr][currentRowNr] =
            boardModel[droppedColNr][droppedRowNr];
        boardModel[droppedColNr][droppedRowNr] = selectedTile.index;

        const nullIdx = tiles.indexOf(null);
        const selectedTileIdx = tiles.indexOf(selectedTile);
        tiles[nullIdx] = selectedTile;
        tiles[selectedTileIdx] = null;

        selectedTile.x = tileWidth * droppedColNr + tileWidth / 2;
        selectedTile.y = tileWidth * droppedRowNr + tileWidth / 2;

        selectedTile.isSelected = false;
        selectedTile = null;
        isUserMoving = false;
    } else {
        tiles.forEach((tile) => {
            if (tile !== null) {
                if (
                    inRange(
                        mouseX,
                        tile.x - tile.width / 2,
                        tile.x + tile.width / 2
                    ) &&
                    inRange(
                        mouseY,
                        tile.y - tile.width / 2,
                        tile.y + tile.width / 2
                    )
                ) {
                    selectedTile = tile;
                    tile.isSelected = true;
                    prevMouseX = mouseX;
                    prevMouseY = mouseY;
                    prevTileX = tile.x;
                    prevTileY = tile.y;
                    isUserMoving = true;
                }
            }
        });
    }
}

function draw() {
    background(255);

    if (checkWin()) {
        console.log("Winner!");
        hasWon = true;
    }

    // if a tile is selected, move the tile if valid
    if (isUserMoving) {
        const mouseXDiff = mouseX - prevMouseX;
        const mouseYDiff = mouseY - prevMouseY;

        // move the tile in the correct direction
        abs(mouseXDiff) >= abs(mouseYDiff)
            ? mouseXDiff !== 0 &&
              moveTile(selectedTile, "x", mouseXDiff / abs(mouseXDiff))
            : mouseYDiff !== 0 &&
              moveTile(selectedTile, "y", mouseYDiff / abs(mouseYDiff));
    }

    // show each tile
    tiles.forEach((tile) => {
        if (tile) {
            tile.show(hasWon);
        }
    });
}

//-----HELPER FUNCTIONS-----
function inRange(val, low, high) {
    return val >= low && val <= high;
}

// moves a selected tile according to the mouse position.  Parameters:
// @tile: reference to the selected tile object
// @axis: "x" or "y",
// @direction: 1 or -1, where 1 represents positive, and -1 represents negative
function moveTile(tile, axis, direction) {
    const colNr = boardModel.indexOf(
        boardModel.find((col) => col.includes(tile.index))
    );
    const rowNr = boardModel[colNr].indexOf(tile.index);

    if (checkIfMoveLegal(rowNr, colNr, axis, direction)) {
        if (axis === "x") {
            if (direction === 1) {
                if (
                    colNr !== nrTilesInRow - 1 &&
                    mouseX <= canvasWidth - tileWidth / 2
                ) {
                    tile.x = Math.min(mouseX, prevTileX + tileWidth);
                }
            } else {
                if (colNr !== 0 && mouseX >= tileWidth / 2) {
                    tile.x = Math.max(mouseX, prevTileX - tileWidth);
                }
            }
        } else {
            if (direction === 1) {
                if (
                    rowNr !== nrTilesInRow - 1 &&
                    mouseY <= canvasWidth - tileWidth / 2
                ) {
                    tile.y = Math.min(mouseY, prevTileY + tileWidth);
                }
            } else {
                if (rowNr !== 0 && mouseY >= tileWidth / 2) {
                    tile.y = Math.max(mouseY, prevTileY - tileWidth);
                }
            }
        }
    }
}

// checks the desired move results in filling the empty space
function checkIfMoveLegal(rowNr, colNr, axis, direction) {
    if (axis === "x") {
        return boardModel[colNr + direction][rowNr] === null;
    } else {
        return boardModel[colNr][rowNr + direction] === null;
    }
}

// get column number of the square about to be dropped in
function getDroppedColNr() {
    let x = selectedTile.x;
    let counter = -1;
    while (x >= 0) {
        counter++;
        x -= tileWidth;
    }
    return counter;
}

// get row number of the square about to be dropped in
function getDroppedRowNr() {
    let y = selectedTile.y;
    let counter = -1;
    while (y >= 0) {
        counter++;
        y -= tileWidth;
    }
    return counter;
}

// perform a random permutation on the board
function randomPermutation() {
    // find the coords of the blank square
    const blankColNr = boardModel.indexOf(
        boardModel.find((col) => col.includes(null))
    );
    const blankRowNr = boardModel[blankColNr].indexOf(null);

    // compile a list of the neighbours to the blank square#
    // will be of form (if all available) [left, right, top, bottom]
    let neighbours = [];
    if (blankColNr !== 0) {
        neighbours.push(boardModel[blankColNr - 1][blankRowNr]);
    }
    if (blankColNr !== nrTilesInRow - 1) {
        neighbours.push(boardModel[blankColNr + 1][blankRowNr]);
    }
    if (blankRowNr !== 0) {
        neighbours.push(boardModel[blankColNr][blankRowNr - 1]);
    }
    if (blankRowNr !== nrTilesInRow - 1) {
        neighbours.push(boardModel[blankColNr][blankRowNr + 1]);
    }

    // pick a random neighbour
    const randomIndex = getRandom(0, neighbours.length - 1);
    const neighbourToSwap = tiles.find((tile) => {
        return tile !== null && tile.index === neighbours[randomIndex];
    });

    // find the coordinates of the chosen neighbour
    const neighbourColNr = boardModel.indexOf(
        boardModel.find((col) => col.includes(neighbourToSwap.index))
    );
    const neighbourRowNr = boardModel[neighbourColNr].indexOf(
        neighbourToSwap.index
    );

    // swap the neighbour and the blank square
    boardModel[blankColNr][blankRowNr] = neighbourToSwap.index;
    boardModel[neighbourColNr][neighbourRowNr] = null;
    const temp = tiles.indexOf(neighbourToSwap);
    tiles[tiles.indexOf(null)] = neighbourToSwap;
    tiles[temp] = null;
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function checkWin() {
    for (let i = 0; i < nrTilesInRow; i++) {
        for (let j = 0; j < nrTilesInRow; j++) {
            if (boardModel[i][j] !== null) {
                if (boardModel[i][j] !== i + j * nrTilesInRow + 1) {
                    return false;
                }
            }
        }
    }
    return true;
}
