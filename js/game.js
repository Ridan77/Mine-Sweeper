'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''

const gLevel = {
    SIZE: 4,
    MINES: 2
}

const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gBoard

function init() {
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gBoard = buildBoard()
    updateMinesCountOnBoard()
    renderBoard(gBoard, '.board-container')

    // updateDisplay(0)

}

function buildBoard() {
    const board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])

        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isRevealed: true,
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
            if (!mat[i][j].isRevealed) cell = '🧱'
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

function onCellClicked(elCell){
    if (!gGame.isOn) {
        gGame.isOn=true
        startStopwatch
    }
    console.log('HI')
}

function updateScore(diff) {
    gGame.score += diff
    document.querySelector('h2 span').innerText = gGame.score
}

function gameOver() {
    gGame.isOn = false
    clearInterval(gIntervalGhosts)
    clearInterval(gIntervalCherry)
    var msg = gGame.isVictory ? 'Pacman Win' : 'Game Over'
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
    init()
}


// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // .cell-2-4
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}


// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = `cell-${location.i}-${location.j}`
    return cellClass
}


function startStopwatch() {
    if (running) return
    var startTime = Date.now() - elapsedTime

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

    const seconds = (elapsedTime / 1000).toFixed(2)
    var stopWatch = document.querySelector('.stopwatch')
    stopWatch.innerText = `${seconds} Sec`
}


function getPacmanHTML() {
    return `<div style="transform: rotate(${gPacman.rotatePos}deg)">${PACMAN}</div>`
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