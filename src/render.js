
import config from './config.js'


let foodRadius = 10
function generateRandomHue() {
  return Math.floor(Math.random() * 360)
}

function renderUpdate(context, data, canvasWidth, canvasHeight, pixelRatio, cameraPosition, visible) {
  const scale = Math.max(canvasWidth, canvasHeight) / visible
  const topLeft = {
    x: cameraPosition.x - visible / 2,
    y: config.gameHeight - cameraPosition.y - visible / 2,
  }

  let shiftH = 0
  let shiftW = 0
  if (canvasWidth > canvasHeight) {
    shiftH = (canvasWidth - canvasHeight) / 2
  } else if (canvasHeight > canvasWidth) {
    shiftW = (canvasHeight - canvasWidth) / 2
  }
  context.save()
  context.scale(pixelRatio, pixelRatio)
  context.clearRect(0, 0, canvasWidth, canvasHeight)
  drawGrid(context, canvasWidth, canvasHeight, topLeft, scale, shiftW, shiftH)
  draw_food_cells(context, topLeft, scale, shiftW, shiftH, data.food)
  draw_player_cells(context, topLeft, scale, shiftW, shiftH, data.cells)
  context.stroke()
  drawFps(context)
  context.restore()

}

function draw_player_cells(context, topLeft, scale, shiftW, shiftH, cells_updates) {
  if (!cells_updates) return
  cells_updates.forEach(cells_update => {
    cells_update.forEach(cell => {
      // reset all positions with respect to top left of canvas
      const x = ((cell.pos.x - topLeft.x) * scale) - shiftW
      const y = ((config.gameHeight - cell.pos.y - topLeft.y) * scale) - shiftH
      const radius = cell.radius * scale
      context.beginPath();
      context.strokeStyle = `hsl( ${cell.hue} , 100%, 45%)`
      context.fillStyle = `hsl( ${cell.hue} , 100%, 50%)`
      context.lineWidth = 10
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
      context.stroke()
    });
  });


}

function draw_food_cells(context, topLeft, scale, shiftW, shiftH, food_updates) {
  if (!food_updates) return
  const radius = foodRadius * scale
  food_updates.forEach(food_update => {
    food_update.forEach(cell => {
      // reset all positions with respect to top left of canvas
      const x = ((cell.pos.x - topLeft.x) * scale) - shiftW
      const y = ((config.gameHeight - cell.pos.y - topLeft.y) * scale) - shiftH
      context.beginPath();
      context.strokeStyle = `hsl( ${cell.hue} , 100%, 45%)`
      context.fillStyle = `hsl( ${cell.hue} , 100%, 50%)`
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
      context.stroke()
    });
  });
}

let gridSize = 50

function drawGrid(context, canvasWidth, canvasHeight, topLeft, scale, shiftW, shiftH) {
  let offset = {x: 0, y: 0}
  if (topLeft.x < 0) {
    offset.x = Math.abs(topLeft.x % gridSize) * scale - shiftW
  } else {
    offset.x = (gridSize - (topLeft.x % gridSize)) * scale - shiftW
  }
  if (topLeft.y < 0) {
    offset.y = Math.abs(topLeft.y % gridSize) * scale - shiftH
  } else {
    offset.y = (gridSize - (topLeft.y % gridSize)) * scale - shiftH
  }
  for (let x = offset.x; x <= canvasWidth; x += (gridSize * scale)) {
    context.moveTo(x, 0)
    context.lineTo(x, canvasHeight)
  }
  for (let y = offset.y; y <= canvasWidth; y += (gridSize * scale)) {
    context.moveTo(0, y)
    context.lineTo(canvasWidth, y)
  }
  context.strokeStyle = 'hsl( 0, 0%, 70%)'
  context.stroke()
}

let prevTime = performance.now()
let frames = 0
let fps = '0.00 FPS'

function drawFps(context) {
  let time = performance.now()
  frames++
  if (time >= prevTime + 1000) {
    fps = `${(frames * (1000 / (time - prevTime))).toFixed(1)} FPS`
    prevTime = time
    frames = 0
  }
  context.fillStyle ='hsl(0, 0%, 0%)'
  context.font = '12px Courier New'
  context.textAlign = 'left'
  context.textBaseline = 'top'
  context.fillText(fps, 20, 20)
}



export default {
  renderUpdate,
}


// lets say map is 0 to 1000
// canvas is 500
// player should only see 100
// player position is 100 so he can see 50 to 150
// we need to draw 5 times larger
// top left would be 100 - 500 = -400
// but in canvas it is 0
// player position in canvas should be 250 since it would make it center


// real game player is 100 and can see 50 to 150
// canvas player is 250 and can see 0 to 500
// so (100 - 50) * 5 = 250
// which is (player.x - topleft.x) * scale

// left is player.x - visible / 2



// map is 0 to 1000
// canvas is 500
// player y is 100
// visiblity is 100 so player can see 50 to 150 (850 to 950)

// top origin position would be 850
// gameHeight - player.y - visible/2
// 1000 - 100 - 100/2 = 850



