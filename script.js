const canvas = document.getElementById('tetris')
const ctx = canvas.getContext('2d')

const Score = document.getElementById('score')
const Higescore = document.getElementById('high-score')
const Canavas2 = document.getElementById('next-piece')
const ctx2 = Canavas2.getContext('2d')

const playgame = document.getElementById('play-button')

const BLOCK_SIZE = 40

const NEXT_PIECE_SIZE = 4 * BLOCK_SIZE;

const GRID_COL = 10
const GRID_ROW = 20

const max_Dt = 100



const INPUT_REPEAT_THRESHOLD = 400
const INPUT_REPEAT_INTARVAL = 5;

const INPUT_STATE_INITIAL = 0;
const INPUT_STATE_CHARGING = 1;
const INPUT_STATE_REPEATING = 2;

const KEY_TO_INPUT_TYPE = {
    ArrowLeft: 'moveLeft',
    ArrowRight: 'moveRight',
    ArrowDown: 'moveDown',
    ArrowUp: 'rotate',
    Shift: 'hardDrop',
    r: 'restart',
};

const Sound = {
    ClikSound: new Audio('sound/ClickSound.mp3'),
    PlayGameSound: new Audio('sound/PlayGameSound.mp3'),
    BlockRemoveSound: new Audio('sound/BlockRemoveSound.mp3'),
    GameOverSound: new Audio('sound/GameOverSound.mp3'),
    playGameSound: new Audio('sound/PlayGameSound')
}

const SHAPES = [
    // I
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    // J
    [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    // L
    [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
    // O
    [
        [1, 1],
        [1, 1],
    ],
    // S
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    // T
    [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0],
    ],
    // Z
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
];

const COLORS = [
    '#00f0f0', // I - cyan
    '#0000f0', // J - blue
    '#f0a000', // L - orange
    '#f0f000', // O - yellow
    '#00f000', // S - green
    '#a000f0', // T - purple
    '#f00000', // Z - red
];

const BLOCK_BACKGROUND_COLOR = '#303030'
const BlockColor = '#44444493'
const COLOR_GAME_OVER_OVERLAY = '#000000bb';

const GRAVITY_SPEED = 1;
const GRAVITY_ACCELERATION = 0.00001;
const GRAVITY_THRESHOLD = 1000;


const CANAVAS_HEIGHT = GRID_ROW * BLOCK_SIZE
const CANAVAS_WIDTH = GRID_COL * BLOCK_SIZE

const EmptyGrid = -1


const GRID_WIDTH = GRID_COL * BLOCK_SIZE;
const GRID_HEIGHT = GRID_ROW * BLOCK_SIZE;

function playSound(sound) {
    sound.currentTime = 0
    sound.play()
}

function DrawCanavas() {
    canvas.width = CANAVAS_WIDTH
    canvas.height = CANAVAS_HEIGHT

    Canavas2.width = NEXT_PIECE_SIZE
    Canavas2.height = NEXT_PIECE_SIZE

    canvas.style.visibility = 'visible'

    Canavas2.style.visibility = 'visible'
    ctx2.fillStyle = '#000'
    ctx2.fillRect(0, 0, NEXT_PIECE_SIZE, NEXT_PIECE_SIZE)

    return ctx
}

function CreateEmptyGrid() {
    return Array.from({ length: GRID_ROW }, () => Array(GRID_COL).fill(EmptyGrid))
}


function getRendomIndex(number) {
    return Math.floor(Math.random() * number)

}

function getRandomShepId() {
    return getRendomIndex(SHAPES.length)
}


function CurrantPice(ShepId) {
    const shep = SHAPES[ShepId]

    return {
        ShepId,
        shep,
        postion: {
            x: getRendomIndex(GRID_COL - SHAPES[0].length + 1),
            y: 0
        }
    }
}

function initialStat() {
    const initialShep = getRandomShepId()

    return {
        gameOver: false,
        Score: 0,
        HigeScore: 0,
        gravity: {
            speed: GRAVITY_SPEED,
            progress: 0
        },
        currantPice: CurrantPice(initialShep),
        nextShepId: getRandomShepId(),
        grids: CreateEmptyGrid()
    }
}





function DraweBlock(ctx, color, x, y) {
    ctx.fillStyle = color
    return ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 1, BLOCK_SIZE - 1)
};


function DrawShep(ctx, shep, colorId, x, y) {

    const color = COLORS[colorId]
    for (let i = 0; i < shep.length; i++) {
        for (let j = 0; j < shep[0].length; j++) {
            if (shep[i][j]) {
                DraweBlock(ctx, color, x + j * BLOCK_SIZE, y + i * BLOCK_SIZE)
            }

        }
    }
}


function Rander(ctx, state) {
    const { grids, currantPice, nextShepId } = state
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, CANAVAS_WIDTH, CANAVAS_HEIGHT)


    // next pice drwe karava mate che ek pice randar thaya paci biju eras kari shakay che anan athi 

    ctx2.fillStyle = '#000'
    ctx2.fillRect(0, 0, CANAVAS_WIDTH, CANAVAS_HEIGHT)


    for (let i = 0; i < grids.length; i++) {

        for (let j = 0; j < grids[0].length; j++) {
            const colorID = grids[i][j]

            let color;
            if (colorID === EmptyGrid) {
                color = BlockColor
                DraweBlock(ctx, color, j * BLOCK_SIZE, i * BLOCK_SIZE)
            } else {
                color = COLORS[colorID]
                DraweBlock(ctx, color, j * BLOCK_SIZE, i * BLOCK_SIZE)
            }
        }
    }

    // maine gride mate che shep 
    DrawShep(
        ctx,
        currantPice.shep,
        currantPice.ShepId,
        currantPice.postion.x * BLOCK_SIZE,
        currantPice.postion.y * BLOCK_SIZE
    )

    // sidebar na canavas mate che shep
    DrawShep(ctx2, SHAPES[nextShepId], nextShepId, 5, BLOCK_SIZE)


    const score = state.Score.toString().padStart(7, '0')
    Score.innerText = `Score: ${score}`

    // game over 
    if (state.gameOver) {
        ctx.fillStyle = COLOR_GAME_OVER_OVERLAY
        ctx.fillRect(0, 0, CANAVAS_WIDTH, CANAVAS_HEIGHT)
        ctx.font = 'bold 40px cursive'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Game over!', GRID_WIDTH / 2, CANAVAS_HEIGHT / 2);

    }
}

function gridFitShep(grid, shep, shepX, shepY) {

    return shep.every((row, i) => {


        const gridY = shepY + i

        return row.every((isSolid, j) => {
            const gridX = shepX + j


            if (!isSolid) {

                return true
            }


            if (gridY >= grid.length) {
                return false;
            }

            if (gridX < 0 || gridX >= grid[0].length) {

                return false
            }

            if (gridY < 0) {
                return true
            }

            return grid[gridY][gridX] === EmptyGrid;

        })
    })
}

// move ment parat 


function HandaleInputs(input, dt) {
    if (!input) {
        return false
    }

    input.timer += dt

    switch (input.state) {
        case INPUT_STATE_INITIAL:
            input.state = INPUT_STATE_CHARGING
            return true;

        case INPUT_STATE_CHARGING:
            const IsCharging = input.timer >= INPUT_REPEAT_THRESHOLD
            if (IsCharging) {
                input.state = INPUT_STATE_REPEATING
                input.timer = 0
            }
            return IsCharging;

        case INPUT_STATE_REPEATING:
            const shouldRepeat = input.timer >= INPUT_REPEAT_INTARVAL
            if (shouldRepeat) {
                input.timer = 0;
            }
    }
}

function CollatingInputs(inputs) {

    function handleKeyEvent(event, inputValue) {
        const inputType = KEY_TO_INPUT_TYPE[event.key];
        if (event.repeat) {
            return;
        }

        if (inputType) {
            inputs[inputType] = inputValue;
        }


    }

    window.addEventListener('keydown', (e) => handleKeyEvent(e, { state: INPUT_STATE_INITIAL, timer: 0 }))
    window.addEventListener('keyup', (e) => handleKeyEvent(e, undefined))

}

function MoveMentPice(grid, currantPice, moveX, moveY) {
    const { shep, postion } = currantPice

    const { x, y } = postion

    const CanMove = gridFitShep(grid, shep, x + moveX, y + moveY)

    if (CanMove) {
        postion.x += moveX


        postion.y += moveY

    }
    return CanMove
}




function handleCurrantPice(state, inputs, dt) {

    const { grids, currantPice } = state

    const InputActive = (inputType) => HandaleInputs(inputs[inputType], dt)

    if (InputActive('moveLeft')) {
        MoveMentPice(grids, currantPice, -1, 0)
        playSound(Sound.ClikSound)
    }
    if (InputActive('moveRight')) {
        MoveMentPice(grids, currantPice, 1, 0)
        playSound(Sound.ClikSound)
    }
    if (InputActive('rotate')) {
        RotateCurrantShep(grids, currantPice)
        playSound(Sound.ClikSound)
    }
    if (InputActive('moveDown')) {
        MoveMentPice(grids, currantPice, 0, 1)
        playSound(Sound.ClikSound)

    }
    if (InputActive('hardDrop')) {
        while (MoveCurrantPiceDowen(state)) { }
        playSound(Sound.ClikSound)
    }
}

function clearLines(grid) {
    let CleraLine = 0
    for (let i = grid.length - 1; i >= 0; i--) {
        const Grids = grid[i]
        const Grids_Boolan = Grids.every((grids) => grids !== EmptyGrid)

        if (Grids_Boolan) {
            playSound(Sound.BlockRemoveSound)
            CleraLine++
        }

        else if (CleraLine > 0) {
            grid[i + CleraLine] = [...grid[i]]
        }
    }

    for (let i = 0; i < CleraLine; i++) {
        grid[i].fill(EmptyGrid)

    }
    // playSound(Sound.BlockRemoveSound)
    return CleraLine
}

function attechGrid(grid, currantPice) {
    const { ShepId, postion, shep } = currantPice

    for (let i = 0; i < shep.length; i++) {
        for (let j = 0; j < shep[0].length; j++) {
            if (shep[i][j]) {
                grid[postion.y + i][postion.x + j] = ShepId
            }

        }
    }
}

function HandalCurrantLnadingpice(state) {
    attechGrid(state.grids, state.currantPice)

    const ClearLines = clearLines(state.grids)


    state.Score += ClearLines


    const newPice = CurrantPice(state.nextShepId)
    const { shep, postion } = newPice

    if (gridFitShep(state.grids, shep, postion.x, postion.y)) {
        state.currantPice = newPice
        state.nextShepId = getRandomShepId()

    } else {
        state.gameOver = true

        let savedHighScore = localStorage.getItem('highScore') || 0

        if (state.Score > savedHighScore) {
            localStorage.setItem('highScore', state.Score)
            Higescore.innerText = `High Score: ${state.Score}`
        }
        playSound(Sound.GameOverSound)

    }

}



function MoveCurrantPiceDowen(state) {

    state.gravity.progress = 0

    const MoveDowen = MoveMentPice(state.grids, state.currantPice, 0, 1)

    if (!MoveDowen) {
        HandalCurrantLnadingpice(state)

    };

    return MoveDowen
}

function updateGravity(state, dt) {
    const { gravity } = state
    gravity.speed += GRAVITY_ACCELERATION * dt

    gravity.progress += gravity.speed * dt

    if (gravity.progress >= GRAVITY_THRESHOLD) {
        MoveCurrantPiceDowen(state)
    }

}


function rotate(shep) {
    return Array.from({ length: shep[0].length }, (_, i) => {
        return Array.from({ length: shep.length }, (_, j) => {
            return shep[shep.length - 1 - j][i];
        })

    })
}


function RotateCurrantShep(grid, CurrantPice) {
    const { shep, postion } = CurrantPice
    const newshep = rotate(shep)
    //console.log(shep)
    if (gridFitShep(grid, newshep, postion.x, postion.y)) {
        CurrantPice.shep = newshep
    }
}



// reset game

function ResetGame(state) {
    Object.assign(state, initialStat())

}

function update(state, Dt, inputs) {
    if (state.gameOver) {

        if (inputs.restart) {
            ResetGame(state)
        }

    } else {
        handleCurrantPice(state, inputs, Dt)
        updateGravity(state, Dt)
    }
}

function main() {
    const ctx = DrawCanavas()
    const state = initialStat()
    const inputs = {}

    let savedHighScore = Number(localStorage.getItem('highScore')) || 0
    const formattedScore = savedHighScore.toString().padStart(7, '0')

    Higescore.innerText = `High Score: ${formattedScore}`

    let PreviousTime = performance.now()

    CollatingInputs(inputs)
    function loop(curranTime) {
        const Dt = Math.min(curranTime - PreviousTime, max_Dt)
        PreviousTime = curranTime
        Rander(ctx, state)
        update(state, Dt, inputs)
        requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)

}
initialStat()
DrawCanavas()
playgame.addEventListener('click', main)