<script>
  import { renderable } from "./Canvas.svelte";
  import Text from './Text.svelte'

  export let idx
  export let score
  export let parentX
  export let parentY
  export let relativeX
  export let relativeY

  $: score_text = `${idx + 1}. ${score[0].substring(0, 15)}${score[0].length>2? '...' : ''}    ${score[1]}`
  $: x = parentX + relativeX
  $: y = parentY + relativeY

</script>

<Text
  text={score_text}
  fontFamily='Courier New'
  color='hsl(0, 0%, 100%)'
  align='left'
  x={x}
  y={y}
/>
