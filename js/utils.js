'use strict'

//Sprint


// location such as: {i: 2, j: 7}
function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}


function getRandomRgbColor() {
  // Generate random values for red, green, and blue (0-255)
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  // Return the color in RGB format
  return `rgb(${r}, ${g}, ${b})`;
}


function findEmptyPos() {
    const emptyPositions = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell === EMPTY) {
                const pos = { i, j }
                emptyPositions.push(pos)
            }
        }
    }
    if (emptyPositions.length === 0) return null
    const randIdx = getRandomIntInclusive(0, emptyPositions.length)
    const emptyPos = emptyPositions[randIdx]
    return emptyPos
}
