<script>
  import { renderable } from "./Canvas.svelte";
  import Text from "./Text.svelte";

  let text
  let frames = 0
  let prevTime = performance.now()

  renderable(props => {
    let time = performance.now()
    frames++
    if (time >= prevTime + 1000) {
      const fps = frames * (1000 / (time - prevTime))
      text = `${fps.toFixed(1)} FPS`
      prevTime = time
      frames = 0
    }
  })

</script>

<Text
  {text}
  fontSize=12
  fontFamily='Courier New'
  align='left'
  baseline='top'
  x={20}
  y={20}
/>