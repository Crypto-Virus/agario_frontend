<script context="module">
  export let canvas
  export let context
</script>

<script>

  import { onMount, onDestroy, setContext } from 'svelte'
  import config from './config.js'
  import {width, height, pixelRatio} from './game.js'

  export let render = () => {}

  let frame

  onMount(() => {
    context = canvas.getContext('2d')

    return createLoop(() => {
      render()
    })
  })

  function createLoop (fn) {
    (function loop() {
      frame = requestAnimationFrame(loop);
      fn();
    })();
    return () => {
      cancelAnimationFrame(frame);
    };
  }

  function handleResize () {
    width.set(window.innerWidth)
    height.set(window.innerHeight)
    pixelRatio.set(window.devicePixelRatio)
    console.log($width, $height, $pixelRatio)
  }

</script>



<canvas
  bind:this={canvas}
  width={$width * $pixelRatio}
  height={$height * $pixelRatio}
  style="width: {$width}px; height: {$height}px;"
/>
<svelte:window on:resize|passive={handleResize}/>




<style>
  canvas {
    background-color: hsl(0, 0%, 79%);
    display: block;
    /* border: solid black 1px; */
    /* width: 5000px;
    height: 5000px; */
  }
</style>