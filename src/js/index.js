const containerNode = document.getElementById('fifteen')
const gameNode = document.getElementById('game')
const itemNodes = Array.from(containerNode.querySelectorAll('.item'));
const countItems = 16;

if (itemNodes.length !== 16) {
    throw new Error(`Должно быть ровно ${countItems} элементов в HTML`)
}

/* 1. Position */
itemNodes[countItems - 1].style.display = 'none'
let matrix = getMatrix(
    itemNodes.map((item) => Number(item.dataset.matrixId))
);

setPositionItems(matrix)


/* 2. Shuffle */
/* document.getElementById('shuffle').addEventListener('click', () => {
    const shuffledArray = shuffleArray(matrix.flat());
    matrix = getMatrix(shuffledArray)
    setPositionItems(matrix)
}) */
const maxShuffleCount = 100;
let timer;
let shuffled = false;
const shuffledClassName = 'gameShuffle'
document.getElementById('shuffle').addEventListener('click', () => {

    if(shuffled) {
        return
    }
    shuffled = true;
    let shuffleCount = 0;
    clearInterval(timer)
    gameNode.classList.add(shuffledClassName)
    if (shuffleCount === 0) {
        timer = setInterval(() => {
            randomSwap(matrix)
            setPositionItems(matrix)

            shuffleCount += 1
            if (shuffleCount >= maxShuffleCount) {
                gameNode.classList.remove(shuffledClassName)
                clearInterval(timer);
                shuffled = false;
            }
        }, 60)
    }
})


/* 3. Change position by click */
const blankNumber = 16;
containerNode.addEventListener('click', (event) => {
    if(shuffled) {
        return
    }
    const buttonNode = event.target.closest('button');

    if (!buttonNode) {
        return
    }
    const buttonNumber = Number(buttonNode.dataset.matrixId)
    const buttonCoords = findCoordinatesByNumber(buttonNumber, matrix)
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix)
    const isValid = isValidForSwap(buttonCoords, blankCoords)

    if (isValid) {
        swap(blankCoords, buttonCoords, matrix)
        setPositionItems(matrix)
    }

})
/* 4. Change position by arrows */
window.addEventListener('keydown', (event) => {
    if(shuffled) {
        return
    }
    if (!event.key.includes('Arrow')) {
        return;
    }
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
    const buttonCoords = {
        x: blankCoords.x,
        y: blankCoords.y
    }
    const direction = event.key.split('Arrow')[1].toLocaleLowerCase();
    const maxIndexMatrix = matrix.length


    switch (direction) {
        case 'up':
            buttonCoords.y += 1;
            break;
        case 'down':
            buttonCoords.y -= 1;
            break;
        case 'left':
            buttonCoords.x += 1;
            break;
        case 'right':
            buttonCoords.x -= 1;
            break;
    }
    if (buttonCoords.y >= maxIndexMatrix || buttonCoords.y < 0 ||
        buttonCoords.x >= maxIndexMatrix || buttonCoords.x < 0) {
        return;
    }

    swap(blankCoords, buttonCoords, matrix)
    setPositionItems(matrix)
})
/* 4. Show Won */






/* Helpers */
let blockedCoords = null;
function randomSwap(matrix) {
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
    const validCoords = findValidCoords({
        blankCoords,
        matrix,
        blockedCoords,
    })

    const swapCoords = validCoords[
        Math.floor(Math.random() * validCoords.length)
    ];
    swap(blankCoords, swapCoords, matrix)
    blockedCoords = blankCoords
}

function findValidCoords({ blankCoords, matrix, blockedCoords }) {
    const validCoords = [];
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (isValidForSwap({ x, y }, blankCoords)) {
                if (!blockedCoords || !(
                    blockedCoords.x === x && blockedCoords.y === y
                )) {
                    validCoords.push({ x, y });
                }
            }
        }
    }
    return validCoords
}

function getMatrix(arr) {
    const matrix = [[], [], [], []];
    let y = 0;
    let x = 0;

    for (let i = 0; i < arr.length; i++) {
        if (x >= 4) {
            y++;
            x = 0;
        }
        matrix[y][x] = arr[i];
        x++
    }
    return matrix;
}

function setPositionItems(matrix) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            const value = matrix[y][x];
            const node = itemNodes[value - 1]
            setNodeStyles(node, x, y)
        }
    }
}

function setNodeStyles(node, x, y) {
    const shiftPs = 100;
    node.style.transform = `translate3D(${x * shiftPs}%, ${y * shiftPs}%, 0)`
}

function shuffleArray(arr) {
    return arr
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}

function findCoordinatesByNumber(number, matrix) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (matrix[y][x] === number) {
                return { x, y };
            }
        }
    }
    return null
}

function isValidForSwap(coords1, coords2) {
    const diffX = Math.abs(coords1.x - coords2.x)
    const diffY = Math.abs(coords1.y - coords2.y)

    return (diffX === 1 || diffY === 1) && (coords1.x === coords2.x || coords1.y === coords2.y)
}

function swap(coords1, coords2, matrix) {
    const coords1Number = matrix[coords1.y][coords1.x];
    matrix[coords1.y][coords1.x] = matrix[coords2.y][coords2.x];
    matrix[coords2.y][coords2.x] = coords1Number;

    if (isWon(matrix)) {
        addWonClass();
    }
}


const winFlatArr = new Array(16).fill(0).map((_, i) => i + 1)

function isWon(matrix) {
    const flatMatrix = matrix.flat();
    for (let i = 0; i < winFlatArr.length; i++) {
        if (flatMatrix[i] !== winFlatArr[i]) {
            return false
        }
    }
    console.log(flatMatrix === matrix.flat())
    return true
}

const wonClass = 'fifteenWon';

function addWonClass() {
    setTimeout(() => {
        containerNode.classList.add(wonClass);


        setTimeout(() => {
            containerNode.classList.remove(wonClass)
        }, 1000);
    }, 200);
}