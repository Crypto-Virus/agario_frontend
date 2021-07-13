<script>
  import { getContext } from 'svelte';

  import { renderable } from './Canvas.svelte'
  import { cameraKey } from './Camera.svelte'
  import { gameData } from './store'

  export let radius = 10

  const { topLeft, scale, shiftH, shiftW} = getContext(cameraKey)

  renderable(props => {
    const context = props.context
    const food = gameData.food
    const scaled_radius = radius * $scale
    food.forEach(cell => {
      // reset all positions with respect to top left of canvas
      const x = ((cell.pos.x - $topLeft.x) * $scale) - $shiftW
      const y = ((gameData.gameHeight - cell.pos.y - $topLeft.y) * $scale) - $shiftH
      context.beginPath();
      context.strokeStyle = `hsl( ${cell.hue} , 100%, 45%)`
      context.fillStyle = `hsl( ${cell.hue} , 100%, 50%)`
      context.arc(x, y, scaled_radius, 0, Math.PI * 2)
      context.fill()
      context.stroke()
    });
  })
</script>