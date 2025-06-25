'use strict'
//sprint

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
const HIDE = '🧱'
const gLevel = {
    SIZE: 4,
    MINES: 2
}

const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isWin: false,
}
var gBoard


var running = false
var elapsedTime = 0
var stopwatchInterval

function init() {
    gGame.isOn = false
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.isWin = false
    gBoard = buildBoard()
    updateMinesCountOnBoard()
    renderBoard(gBoard, '.board-container')
    allowRightClick()


}

function buildBoard() {
    const board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])

        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isRevealed: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    board[2][2].isMine = true
    board[3][3].isMine = true
    return board
}

function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            var cell
            if (!mat[i][j].isRevealed) cell = HIDE
            else cell = mat[i][j].minesAroundCount
            const className = 'cell cell-' + i + '-' + j
            strHTML += `<td class="${className}" onclick="onCellClicked(this)">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function allowRightClick() {
    const elCells = document.querySelectorAll('.cell')
    for (var i = 0; i < elCells.length; i++) {
        var currElCell = elCells[i]
        currElCell.addEventListener("contextmenu", (e) => { e.preventDefault() })
        currElCell.oncontextmenu = function () { onRightCellClicked(this) }
    }


}
function onRightCellClicked(elCell) {
    var location = getCellCoord((elCell.classList[1]))
    if (!gGame.isOn) {
        gGame.isOn = true
        startStopwatch()
    }
    if (gBoard[location.i][location.j].isRevealed) return
    if (!gBoard[location.i][location.j].isMarked) {
        gBoard[location.i][location.j].isMarked = true
        renderCell(location, FLAG)
        gGame.markedCount++
    } else {
        gBoard[location.i][location.j].isMarked = false
        renderCell(location, HIDE)
        gGame.markedCount--
    }
    checkGameOver()
}

function onCellClicked(elCell) {
    var location = getCellCoord((elCell.classList[1]))
    if (!gGame.isOn) {
        gGame.isOn = true
        startStopwatch()
    }
    if (gBoard[location.i][location.j].isMine) {
        renderCell(location, MINE)
        console.log('Game Over')
        gameOver()
        return
    }


    if (gBoard[location.i][location.j].minesAroundCount > 0) revealeCell(location)
    else gBoard = expandReveal(gBoard, location, 0)

    checkGameOver()
    console.log('Marked Flags:', gGame.markedCount)
    console.log('Revealed cells:', gGame.revealedCount)

}

function revealeCell(location) {
    if (gBoard[location.i][location.j].isRevealed) return
    if (gBoard[location.i][location.j].isMarked) return
    gBoard[location.i][location.j].isRevealed = true
    gGame.revealedCount++
    renderCell(location, gBoard[location.i][location.j].minesAroundCount)
}



function expandReveal(board, location, itter) {
    if (itter > 100) return board
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            revealeCell({ i, j })
            // if (board[i][j].minesAroundCount === 0) {
            //     if ((!i !== location.i && j !== location.j) && !board[i][j].isRevealed) {
            //         expandReveal(board, { i, j }, ++itter)
            //     }
            // }
        }
    }
    return board
}

function changeLevel(elbtn) {
    var btnTxt = elbtn.innerText
    if (gGame.isOn) return
    switch (btnTxt) {
        case 'Beginner':
            gLevel.MINES=2
            gLevel.SIZE=4
            break;
        case 'Medium':
            gLevel.MINES = 14
            gLevel.SIZE = 8
            break;
        case 'Expert':

            gLevel.MINES = 32
            gLevel.SIZE = 12
    }
    init()
}

function checkGameOver() {


    var finished = false
    console.log('Marked as much as mines:', gGame.markedCount === gLevel.MINES)
    console.log('Revealed as much as (board - mines) ', (gGame.revealedCount === (gLevel.SIZE ** 2 - gLevel.MINES)))

    finished = (gGame.markedCount === gLevel.MINES) && (gGame.revealedCount === (gLevel.SIZE ** 2 - gLevel.MINES))
    if (finished) {
        gGame.isWin = true
        gameOver()
    }
    return (finished)
}

function gameOver() {
    gGame.isOn = false
    stopStopwatch()
    var msg = gGame.isWin ? 'You Win' : 'Game Over'
    openModal(msg)
}

function openModal(msg) {
    var elModal = document.querySelector('.modal')
    elModal.querySelector('.msg').innerText = msg
    elModal.style.display = "block"
}

function closeModal() {
    var elModal = document.querySelector('.modal')
    elModal.style.display = "none"
}
function restartGame() {
    closeModal()
    document.querySelector('.stopwatch span').innerText = `00:00 min:sec`
    init()
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // .cell-2-4
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

function getCellCoord(strCellId) {
    const coord = {}
    const parts = strCellId.split('-')
    coord.i = +parts[1]
    coord.j = +parts[2]
    return coord
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = `cell-${location.i}-${location.j}`
    return cellClass
}

function startStopwatch() {
    if (running) return
    const startTime = Date.now() - elapsedTime

    running = true
    stopwatchInterval = setInterval(() => {
        elapsedTime = (Date.now() - startTime)
        updateDisplay()
    }, 100)
}

function stopStopwatch() {
    running = false
    clearInterval(stopwatchInterval)
}

function resetStopwatch() {
    stopStopwatch()
    elapsedTime = 0
    updateDisplay()
}

function updateDisplay() {

    const seconds = (elapsedTime / 1000).toFixed(0)
    const minutes = (seconds / 60).toFixed(0)
    var stopWatch = document.querySelector('.stopwatch')
    document.querySelector('.stopwatch span').innerText = `${minutes}:${seconds}`
}

function updateMinesCountOnBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].minesAroundCount = countMinesNeighbours({ i: i, j: j })
        }
    }
}

function countMinesNeighbours(location) {
    var neighborsCount = 0

    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === location.i && j === location.j) continue
            if (gBoard[i][j].isMine) neighborsCount++
        }
    }
    return neighborsCount
}