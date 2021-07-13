<script>
  import { getContext } from 'svelte';
  import { renderable } from './Canvas.svelte'
  import { cameraKey } from './Camera.svelte'

  export let gridSize = 50
  export let gridColor = 'hsl( 0, 0%, 70%)'

  const {topLeft, scale, shiftH, shiftW} = getContext(cameraKey)

  renderable(props => {
    const {context, width, height} = props

    let offset = {x: 0, y: 0}
    if ($topLeft.x < 0) {
      offset.x = Math.abs($topLeft.x % gridSize) * $scale - $shiftW
    } else {
      offset.x = (gridSize - ($topLeft.x % gridSize)) * $scale - $shiftW
    }
    if ($topLeft.y < 0) {
      offset.y = Math.abs($topLeft.y % gridSize) * $scale - $shiftH
    } else {
      offset.y = (gridSize - ($topLeft.y % gridSize)) * $scale - $shiftH
    }

    context.clearRect(0, 0, width, height)
    context.beginPath();

    for (let x = offset.x; x <= width; x += (gridSize * $scale)) {
      context.moveTo(x, 0)
      context.lineTo(x, height)
    }
    for (let y = offset.y; y <= height; y += (gridSize * $scale)) {
      context.moveTo(0, y)
      context.lineTo(width, y)
    }

    context.strokeStyle = gridColor
    context.stroke()


  })
</script>