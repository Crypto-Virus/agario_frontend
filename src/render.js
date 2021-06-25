
import config from './config.js'

let player_cells = []

let context


function renderUpdate(context, data) {
  if (!data) return
  const player_x = data.x
  const player_y = data.y
  origin = {
    x: player_x - config.screenWidth / 2,
    y: config.screenHeight - player_y - config.screenHeight / 2,
  }
  context.save()
  context.clearRect(0, 0, config.screenWidth, config.screenHeight)
  draw_food_cells(context, origin, data.food)
  draw_player_cells(context, origin, data.cells)
  context.restore()
}

function draw_player_cells(context, origin, cells) {
  if (!cells) return
  cells.forEach(cell => {
    // reset all positions with respect to top left of canvas
    const scale = config.gameWidth / config.screenWidth
    const x = cell.pos.x - origin.x
    const y = config.screenHeight - cell.pos.y - origin.y
    const radius = cell.radius * scale
    context.beginPath();
    context.strokeStyle = `hsl( ${cell.hue} , 100%, 45%)`
    context.fillStyle = `hsl( ${cell.hue} , 100%, 50%)`
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
    context.stroke()
  })
}

function draw_food_cells(context, origin, food_cells) {
  if (!food_cells) return
  food_cells.forEach(cell => {
    // reset all positions with respect to top left of canvas
    const scale = config.gameWidth / config.screenWidth
    const x = cell.pos.x - origin.x
    const y = config.screenHeight - cell.pos.y - origin.y
    const radius = cell.radius * scale
    context.beginPath();
    context.strokeStyle = `hsl( ${cell.hue} , 100%, 45%)`
    context.fillStyle = `hsl( ${cell.hue} , 100%, 50%)`
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
    context.stroke()
  })
}


export default {
  renderUpdate,
}