const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d');

const $sprite = document.querySelector('#sprite')
const $bricks = document.querySelector('#bricks')

canvas.width = 448
canvas.height = 400;

/* ------------------------------------------------------------------------------------------------------- */

const ballRadius = 3
let x = canvas.width / 2
let y = canvas.height - 30
let dx = 2
let dy = -2

/* ------------------------------------------------------------------------------------------------------- */

const paddleHeight = 10
const paddleWidth = 50
let paddleX = (canvas.width - paddleWidth) / 2
let paddleY = canvas.height - paddleHeight - 10

let rightPressed = false
let leftPressed = false
let paddleBlocked = false

/* ------------------------------------------------------------------------------------------------------- */

const bricksRowsCount = 6
const bricksColumnsCount = 13
const brickWidth = 30
const brickHeight = 14
const bricksPadding = 2
const bricksOffsetTop = 80
const bricksOffsetLeft = 17
const bricks = []

const BRICKS_STATUS = { ACTIVE: 1, DESTROYED: 0 }

for ( let c = 0; c < bricksColumnsCount; c++) {
    bricks[c] = []
    for ( let r = 0; r < bricksRowsCount; r++ ) {
        const brickX = c * (brickWidth + bricksPadding) + bricksOffsetLeft
        const brickY = r * (brickHeight + bricksPadding) + bricksOffsetTop
        const random = Math.floor(Math.random() * 8)
        bricks[c][r] = {
            x: brickX,
            y: brickY,
            status: BRICKS_STATUS.ACTIVE,
            color: random
        }
    }
}

/* ------------------------------------------------------------------------------------------------------- */

const PADDLE_SENSITIVITY = 7

function drawBall() {
    ctx.beginPath()
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.closePath()
}

function drawPaddle() {
    ctx.drawImage(
        $sprite,        // Imagen
        29,             // ClipX (coordenadas de recorte)
        174,            // ClipY (coordenadas de recorte)
        paddleWidth,    // Tamaño del recorte X
        paddleHeight,   // Tamaño del recorte Y
        paddleX,        // Posición X del dibujo
        paddleY,        // Posición Y del dibujo
        paddleWidth,    // Ancho del dibujo
        paddleHeight    // Alto del dibujo
    )
}

function drawBricks() {
    for ( let c = 0; c < bricksColumnsCount; c++ ) {
        for ( let r = 0; r < bricksRowsCount; r++ ) {
            const currentBrick = bricks[c][r]
            if (currentBrick.status === BRICKS_STATUS.DESTROYED) continue
            
            const ClipX = currentBrick.color * 32
            ctx.drawImage(
                $bricks,
                ClipX,
                0,
                32,
                16,
                currentBrick.x,
                currentBrick.y,
                brickWidth,
                brickHeight
            )
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < bricksColumnsCount; c++) {
        for (let r = 0; r < bricksRowsCount; r++) {
            const currentBrick = bricks[c][r]
            if (currentBrick.status === BRICKS_STATUS.DESTROYED) continue

            const ballCenterX = x
            const ballCenterY = y

            const isBallInsideBrickX = ballCenterX + ballRadius > currentBrick.x && ballCenterX - ballRadius < currentBrick.x + brickWidth
            const isBallInsideBrickY = ballCenterY + ballRadius > currentBrick.y && ballCenterY - ballRadius < currentBrick.y + brickHeight

            if (isBallInsideBrickX && isBallInsideBrickY) {
                dy = -dy
                currentBrick.status = BRICKS_STATUS.DESTROYED
            }
        }
    }
}

function ballMovement() {
    const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleWidth
    const isBallTouchingPaddleTop = y + dy > paddleY && y + dy < paddleY + PADDLE_SENSITIVITY

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx
    } if (isBallSameXAsPaddle && isBallTouchingPaddleTop) {
        dy = -dy
    } else if (y + dy < ballRadius) {
        dy = -dy
    } if (y + dy > canvas.height - ballRadius) {
        if (!paddleBlocked) {
            console.log('GAME OVER')
            paddleBlocked = true
            setTimeout(() => {
                paddleBlocked = false
                document.location.reload()
            }, 1000)
        }
    }

    x += dx
    y += dy
}

function paddleMovement() {
    if (!paddleBlocked) {
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += PADDLE_SENSITIVITY
        } else if (leftPressed && paddleX > 0) {
            paddleX -= PADDLE_SENSITIVITY
        }
    }
}

function cleanCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function initEvents() {
    document.addEventListener('keydown', KeyDownHandler)
    document.addEventListener('keyup', KeyUpHandler)

    function KeyDownHandler(event) {
        const { key } = event
        if ( key === 'Right' || key === 'ArrowRight' ) {
            rightPressed = true
        } else if ( key === 'Left' || key === 'ArrowLeft' ) {
            leftPressed = true
        }
    }

    function KeyUpHandler(event) {
        const { key } = event
        if ( key === 'Right' || key === 'ArrowRight' ) {
            rightPressed = false
        } else if ( key === 'Left' || key === 'ArrowLeft' ) {
            leftPressed = false
        }
    }
}

function draw() {
    cleanCanvas()
    drawBall()
    drawPaddle()
    drawBricks()

    collisionDetection()
    ballMovement()
    paddleMovement()

    window.requestAnimationFrame(draw)
}

draw()
initEvents()