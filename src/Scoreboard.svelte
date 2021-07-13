<script>
  import { renderable } from './Canvas.svelte'
  import Score from './Score.svelte'
  import { scores } from './store.js'

  export let scoreboardWidth = 250
  export let scoreboardHeight = 250

  let scoreboardX = 0
  let scoreboardY = 10

  renderable(props => {
    const {context, width, height} = props

    scoreboardX = width - 10 - scoreboardWidth

    context.fillStyle = 'hsl(0, 0%, 30%, 0.65)'
    context.fillRect(
      scoreboardX,
      scoreboardY,
      scoreboardWidth,
      scoreboardHeight
    )
  })


</script>



{#each $scores as score, i}
  <Score
    idx={i}
    {score}
    parentX={scoreboardX}
    parentY={scoreboardY}
    relativeX={10}
    relativeY={20 + 20 * i}/>
{/each}