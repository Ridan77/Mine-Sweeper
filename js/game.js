'use strict'
//sprint

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
const HIDE = '🧱'
const NORMAL = '😁'
const WIN = '😎'
const LOSE = '🤯'
const SAFE = '🛟'
const FLAG1 = '▶️'
const FLAG2 = '⏹️'

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
    hintsLeft: 0,
    isHint: false,
    isOnHold: false,
    safeClicksLeft: 3,
    isDarkMode: true,
    previousCellLocation: null,
    isMinesAddedManually: false,
    isFinishedGettingMines: true,
    megaHintsLeft: 1,
    isMegaHint: false,
    megaHint1stLocation: null,
    megaHint2ndLocation: null,
    exterminatorLeft: 1,
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
    gGame.hintsLeft = 3
    gGame.safeClicksLeft = 3
    gGame.isFinishedGettingMines = true
    gGame.isMinesAddedManually = false
    gGame.megaHintsLeft = 1
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
    document.querySelector('.minesleft').innerText = gLevel.MINES
    document.querySelector('.lives').innerText = gGame.livesLeft
    document.querySelector('.hints').innerText = gGame.hintsLeft
    document.querySelector('.emoji').innerText = NORMAL
    document.querySelector('.megahints').innerText = gGame.megaHintsLeft
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
    return board
}

function randomizeMines(location) {
    var rndlocations = []

    for (var i = 0; i < gLevel.MINES; i++) {
        var rndI = getRandomIntInclusive(0, gLevel.SIZE - 1)
        var rndJ = getRandomIntInclusive(0, gLevel.SIZE - 1)

        if (!gBoard[rndI][rndJ].isMine && (rndI !== location.i && rndJ !== location.j)) gBoard[rndI][rndJ].isMine = true
        else i--
        rndlocations.push({ i: rndI, j: rndJ })
    }
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

function getAllMines() {
    const minesLocations = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) minesLocations.push({ i, j })
        }
    }
    return minesLocations
}

function renderAllRevealedCells() {
    const revealedCells = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isRevealed) revealedCells.push({ i, j })
        }
    }
    for (var i = 0; i < revealedCells.length; i++) {
        var str = gBoard[revealedCells[i].i][revealedCells[i].j].minesAroundCount
        if (str === 0) str = EMPTY
        renderCell(revealedCells[i], str, false)
    }
}
// exterminator wont work in beginner mode
function exterminator() {
    if (gLevel.SIZE === 4) return
    if (gGame.exterminatorLeft === 0) return
    const allMines = getAllMines()
    if (!allMines) return
    for (var i = 0; i < 3; i++) {
        const rndIdx = getRandomIntInclusive(0, allMines.length - 1)
        var currMine = allMines.splice(rndIdx, 1)[0]
        console.log(currMine)
        gBoard[currMine.i][currMine.j].isMine = false
    }
    updateMinesCountOnBoard()
    renderAllRevealedCells()
    gLevel.MINES -= 3
    document.querySelector('.minesleft').innerText = gLevel.MINES
}

function addMineToModelAndDom(location) {
    gBoard[location.i][location.j].isMine = true
    renderCell(location, MINE, true)
    gLevel.MINES++
}

function onGetMinesManually() {
    if (gGame.isOn) return
    gGame.isMinesAddedManually = true
    gGame.isFinishedGettingMines = false
    gLevel.MINES = 0
    const elOnBtn = document.querySelector('.manualOn')
    elOnBtn.style.backgroundColor = 'yellow'
    elOnBtn.style.color = 'black'
    const elOffBtn = document.querySelector('.manualOff')
    elOffBtn.style.display = 'inline'
}

function onFinishGettingMines() {
    gGame.isFinishedGettingMines = true
    const elOnBtn = document.querySelector('.manualOn')
    elOnBtn.style.backgroundColor = 'white'
    elOnBtn.style.color = 'blueviolet'
    const elOffBtn = document.querySelector('.manualOff')
    elOffBtn.style.display = 'none'
    document.querySelector('.minesleft').innerText = gLevel.MINES
    renderBoard(gBoard, '.board-container')
    allowRightClick()
}

function startGame(location) {
    if (!gGame.isMinesAddedManually) randomizeMines(location)
    if (gGame.isFinishedGettingMines) {
        updateMinesCountOnBoard()
        startStopwatch()
    }
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
        renderCell(location, FLAG, true)
        gGame.markedCount++
        document.querySelector('.minesleft').innerText = gLevel.MINES - gGame.markedCount
    } else {
        gBoard[location.i][location.j].isMarked = false
        renderCell(location, HIDE, true)
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
    if (gGame.isOnHold) return
    if (!gGame.isFinishedGettingMines) {
        addMineToModelAndDom(location)
        return
    }
    if (!gGame.isOn) startGame(location)
    if (gGame.isHint) {
        displayHint(location)
        return
    } else if (gGame.isMegaHint) {
        displayMegaHit(location)
        return
    }
    if (gBoard[location.i][location.j].isMine) {
        gameOver(location)
        return
    }
    if (gBoard[location.i][location.j].minesAroundCount > 0) revealeCell(location)
    else {
        revealeCell(location)
        expandReveal(location)
    }
    gGame.previousCellLocation = location
    if (checkGameOver()) {
        gGame.isWin = true
        gameOver(location)
    }
}

function undo() {
    if (!gGame.previousCellLocation) return
    gBoard[gGame.previousCellLocation.i][gGame.previousCellLocation.j].isRevealed = false
    gGame.revealedCount--
    renderCell(gGame.previousCellLocation, HIDE, true)
}

function revealeCell(location) {
    if (gBoard[location.i][location.j].isRevealed) return
    if (gBoard[location.i][location.j].isMarked) return
    gBoard[location.i][location.j].isRevealed = true
    gGame.revealedCount++
    var cellContent = gBoard[location.i][location.j].minesAroundCount
    if (cellContent === 0) {
        renderCell(location, EMPTY, false)
    } else renderCell(location, gBoard[location.i][location.j].minesAroundCount, false)
}

function expandReveal(location) {
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === location.i && j === location.j) continue
            if (gBoard[i][j].isRevealed) continue
            if (gBoard[i][j].minesAroundCount > 0) revealeCell({ i, j })
            else {
                revealeCell({ i, j })
                expandReveal({ i, j })
            }
        }
    }
}
function displayMegaHit(location) {
    const flashedCellsLocations = []

    if (gGame.megaHint1stLocation) gGame.megaHint2ndLocation = location
    else {
        gGame.megaHint1stLocation = location
        renderCell(location, FLAG1, true)
        return
    }
    for (var i = gGame.megaHint1stLocation.i; i <= gGame.megaHint2ndLocation.i; i++) {
        for (var j = gGame.megaHint1stLocation.j; j <= gGame.megaHint2ndLocation.j; j++) {
            if (gBoard[i][j].isRevealed) continue
            if (gBoard[i][j].isMine) {
                renderCell({ i, j }, MINE, true)
                flashedCellsLocations.push({ i, j })
            } else {
                renderCell({ i, j }, gBoard[i][j].minesAroundCount, true)
                flashedCellsLocations.push({ i, j })
            }
        }
    }
    setTimeout(() => {
        for (var i = 0; i < flashedCellsLocations.length; i++) {
            renderCell(flashedCellsLocations[i], HIDE, true)
        }
    }, 1500)
    if (gGame.megaHint2ndLocation) {
        gGame.megaHintsLeft--
        gGame.megaHint1stLocation = null
        gGame.megaHint2ndLocation = null
        gGame.isMegaHint = false
        const elmhint = document.querySelector('.megahints')
        elmhint.style.backgroundColor = 'black'
        elmhint.style.color = 'white'
        elmhint.innerText = gGame.megaHintsLeft
    }
}

function displayHint(location) {
    const flashedCellsLocations = []

    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (gBoard[i][j].isRevealed) continue
            if (gBoard[i][j].isMine) {
                renderCell({ i, j }, MINE, true)
                flashedCellsLocations.push({ i, j })
            } else {
                renderCell({ i, j }, gBoard[i][j].minesAroundCount, true)
                flashedCellsLocations.push({ i, j })
            }
        }
    }
    setTimeout(() => {
        for (var i = 0; i < flashedCellsLocations.length; i++) {
            renderCell(flashedCellsLocations[i], HIDE, true)
        }
    }, 1500)
    gGame.hintsLeft--
    gGame.isHint = false
    const elhint = document.querySelector('.hints')
    elhint.style.backgroundColor = 'black'
    elhint.style.color = 'white'
    document.querySelector('.hints').innerText = gGame.hintsLeft
}

function onToggleHintMode() {
    var elhint = document.querySelector('.hints')
    if (gGame.hintsLeft === 0) return
    if (!gGame.isHint) {
        gGame.isHint = true
        elhint.style.backgroundColor = 'yellow'
        elhint.style.color = 'black'
    }
    else {
        gGame.isHint = false
        elhint.style.backgroundColor = 'black'
        elhint.style.color = 'white'
    }
}

function onToggleMegaHintMode() {

    var elMegaHint = document.querySelector('.megahints')
    if (gGame.megaHintsLeft === 0) return
    if (!gGame.isMegaHint) {
        gGame.isMegaHint = true
        elMegaHint.style.backgroundColor = 'yellow'
        elMegaHint.style.color = 'black'
    }
    else {
        gGame.isMegaHint = false
        elMegaHint.style.backgroundColor = 'black'
        elMegaHint.style.color = 'white'
    }

}

function onSafeClick() {
    if (gGame.safeClicksLeft === 0) return
    const sClicksLocations = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isRevealed) continue
            if (gBoard[i][j].isMine) continue
            if (gBoard[i][j].isMarked) continue
            sClicksLocations.push({ i, j })
        }
    }
    const rndSClickLocation = sClicksLocations[getRandomIntInclusive(0, sClicksLocations.length - 1)]
    renderCell(rndSClickLocation, SAFE, true)
    setTimeout(() => {
        renderCell(rndSClickLocation, HIDE, true)
    }, 1000)
    document.querySelector('.sclicks').innerText = --gGame.safeClicksLeft
}

function toggleDarkMode() {
    if (gGame.isOn) return
    const elBody = document.querySelector('body')
    const elTds = elBody.querySelectorAll('td')
    if (gGame.isDarkMode) {
        elBody.style.backgroundColor = 'white'
        elBody.style.color = 'black'
        for (var i = 0; i < elTds.length; i++) {
            elTds[i].style.backgroundColor = 'white'
            elTds[i].style.color = 'black'
        }
    } else {
        elBody.style.backgroundColor = 'black'
        elBody.style.color = 'white'
        for (var i = 0; i < elTds.length; i++) {
            elTds[i].style.backgroundColor = 'black'
            elTds[i].style.color = 'white'
        }
    }
    gGame.isDarkMode = !gGame.isDarkMode
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
            break;
    }
    init()
}

function checkGameOver() {
    var condition1 = gGame.markedCount === gLevel.MINES
    var condition2 = gGame.revealedCount === (gLevel.SIZE ** 2 - gLevel.MINES)
    return (condition1 && condition2)
}

function gameOver(location) {
    if (gGame.livesLeft > 1 && !gGame.isWin) {
        renderCell(location, MINE)
        gGame.livesLeft--
        document.querySelector('.lives').innerText = gGame.livesLeft
        openModal(`You died, you have ${gGame.livesLeft} Lives to Go`)
        document.querySelector('.modal button').style.display = 'none'
        gGame.isOnHold = true
        setTimeout(() => {
            document.querySelector('.modal button').style.display = 'inline'
            closeModal()
            gGame.isOnHold = false
        }, 3000);
        return
    }
    stopStopwatch()
    var msg = gGame.isWin ? 'You Win' : 'Game Over'
    document.querySelector('.emoji').innerText = gGame.isWin ? WIN : LOSE
    openModal(msg)
    if (!gGame.isMinesAddedManually) storeScore(gLevel.SIZE, gGame.secsPassed)
    gLevel.SIZE = 4
    gLevel.MINES = 2
}


function storeScore(level, score) {
    var levelName
    switch (level) {
        case 4:
            levelName = 'Beginner'
            break;
        case 8:
            levelName = 'Medium'
            break;
        case 12:
            levelName = 'Expert'
            break;

    }
    const bestScore = localStorage.getItem(`${levelName}`)
    if (score / 1000 <= bestScore || bestScore === null) localStorage.setItem(`${levelName}`, `${score / 1000}`);
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

function renderCell(location, value, isFlash) {
    const cellSelector = '.' + getClassName(location) // .cell-2-4
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
    if (!isFlash) elCell.style.backgroundColor = 'grey'
    else elCell.style.backgroundColor = 'black'
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
