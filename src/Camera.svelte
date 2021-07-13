<script context="module">
  export const cameraKey = Symbol()
</script>

<script>
  import { setContext } from "svelte";
  import { renderable } from "./Canvas.svelte";
  import { gameData } from './store.js'
  import { writable } from 'svelte/store'

  const topLeft = writable({x: 0, y: 0})
  const scale = writable(1)
  const shiftW = writable(0)
  const shiftH = writable(0)

  setContext(cameraKey, {topLeft, scale, shiftW, shiftH})

  // visible square range around camera position
  let visible = 0
  let smooth = 0.01

  renderable((props) => {
    const {width, height} = props

    if (!visible) {
      visible = gameData.visible
    } else if (Math.abs(visible - gameData.visible) < .1) {
      visible = gameData.visible
    } else {
      visible = lerp(visible, gameData.visible, smooth)
    }

    $topLeft = {
      x: gameData.position.x - visible / 2,
      y: gameData.gameHeight - gameData.position.y - visible / 2,
    }
    $scale = Math.max(width, height) / visible
    $shiftW = (height > width)? (height - width) / 2 : 0
    $shiftH = (width > height)? (width - height) / 2 : 0
  })

  function lerp(start, end, smooth) {
    return ( 1 - smooth) * start + smooth * end
  }

</script>

<slot></slot>