<script>
import { renderable } from "./Canvas.svelte";

  export let text = ''
  export let color = 'hsl(0, 0%, 0%)'
  export let align = 'center'
  export let baseline = 'middle'

  export let x = 0
  export let y = 0

  export let fontSize = 16
  export let fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica';

  renderable(props => {
    const context = props.context
    if (text) {
      context.fillStyle = color
      context.font = `${fontSize}px ${fontFamily}`
      context.textAlign = align
      context.textBaseline = baseline
      context.fillText(text, x, y)
    }
  })

</script>