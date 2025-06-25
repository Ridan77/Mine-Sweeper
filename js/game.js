'use strict'
//sprint

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
const HIDE = '🧱'
const NORMAL = '😁'
const WIN = '😎'
const LOSE = '🤯'
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
    livesLeft: 3,
}
var gBoard


var running = false
var elapsedTime = 0
var stopwatchInterval

function init() {
    gGame.isOn = false
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.isWin = false
    gGame.livesLeft = 3
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
    document.querySelector('.minesleft').innerText = gLevel.MINES
    document.querySelector('.lives').innerText = gGame.livesLeft
    document.querySelector('.emoji').innerText = NORMAL
    allowRightClick()
}

function buildBoard() {
    const board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])

        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isRevealed: false,    //dont forger to change to false
                isMine: false,
                isMarked: false,
            }
        }
    }
    // board[2][2].isMine = true
    // board[3][3].isMine = true
    return board
}

function randomizeMines(location) {
    var rndlocations = []
    console.log(location.i,location.j)
    for (var i = 0; i < gLevel.MINES; i++) {
        var rndI = getRandomIntInclusive(0, gLevel.SIZE - 1)
        var rndJ = getRandomIntInclusive(0, gLevel.SIZE - 1)

        if (!gBoard[rndI][rndJ].isMine && (rndI !==location.i && rndJ!==location.j)) gBoard[rndI][rndJ].isMine = true
        else i--
        rndlocations.push({ i: rndI, j: rndJ })
    }
    console.log(rndlocations)
    printMines()

}

function printMines() {
    var table = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        table[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) table[i][j] = MINE
            else table[i][j] = ''
        }
    }
    console.table(table)
}

function startGame(location) {
    randomizeMines(location)
    updateMinesCountOnBoard()
    startStopwatch()
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
    if (gBoard[location.i][location.j].isRevealed) return
    if (!gBoard[location.i][location.j].isMarked) {
        gBoard[location.i][location.j].isMarked = true
        renderCell(location, FLAG)
        gGame.markedCount++
        document.querySelector('.minesleft').innerText = gLevel.MINES - gGame.markedCount
    } else {
        gBoard[location.i][location.j].isMarked = false
        renderCell(location, HIDE)
        gGame.markedCount--
        document.querySelector('.minesleft').innerText = gLevel.MINES - gGame.markedCount
    }
    if (checkGameOver()) {
        gGame.isWin = true
        gameOver(location)
    }
}

function onCellClicked(elCell) {
    var location = getCellCoord((elCell.classList[1]))
    if (!gGame.isOn) startGame(location)
    if (gBoard[location.i][location.j].isMine) {
        gameOver(location)
        return
    }
    if (gBoard[location.i][location.j].minesAroundCount > 0) revealeCell(location)
    else gBoard = expandReveal(gBoard, location, 0)
    if (checkGameOver()) {
        gGame.isWin = true
        gameOver(location)
    }
}

function revealeCell(location) {
    if (gBoard[location.i][location.j].isRevealed) return
    if (gBoard[location.i][location.j].isMarked) return
    gBoard[location.i][location.j].isRevealed = true
    gGame.revealedCount++
    var cellContent = gBoard[location.i][location.j].minesAroundCount
    if (cellContent === 0) {
        renderCell(location,EMPTY)
    } else renderCell(location, gBoard[location.i][location.j].minesAroundCount)
    document
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
            gLevel.MINES = 2
            gLevel.SIZE = 4
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
    var condtion1 = gGame.markedCount === gLevel.MINES
    var condtion2 = gGame.revealedCount === (gLevel.SIZE ** 2 - gLevel.MINES)
    return (condtion1 && condtion2)
}

function gameOver(location) {
    if (gGame.livesLeft > 1 && !gGame.isWin) {
        renderCell(location, MINE)
        gGame.livesLeft--
        document.querySelector('.lives').innerText = gGame.livesLeft
        openModal(`You died, you have ${gGame.livesLeft} Lives to Go`)
        document.querySelector('.modal button').style.display = 'none'
        setTimeout(() => {
            document.querySelector('.modal button').style.display = 'inline'
            closeModal()
        }, 3000);
        return
    }
    stopStopwatch()

    var msg = gGame.isWin ? 'You Win' : 'Game Over'
    document.querySelector('.emoji').innerText = gGame.isWin ? WIN : LOSE
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
    document.querySelector('.stopwatch').innerText = `00:00`
    document.querySelector('.minesleft').innerText = gLevel.MINES
    init()
}

function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // .cell-2-4
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
    elCell.style.backgroundColor ='grey'
}

function getCellCoord(strCellId) {
    const coord = {}
    const parts = strCellId.split('-')
    coord.i = +parts[1]
    coord.j = +parts[2]
    return coord
}

function getClassName(location) {
    const cellClass = `cell-${location.i}-${location.j}`
    return cellClass
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
