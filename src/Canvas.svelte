<script context="module">
  export let canvas
  export let context
</script>

<script>

  import { onMount, onDestroy, setContext } from 'svelte'
  import {width, height, pixelRatio, inGameStatus, connectionStatus} from './store.js'

  export let render = () => {}

  let frame

  onMount(() => {
    context = canvas.getContext('2d')
  })

  function startRendering() {
    if (!frame) {
      createLoop(render)
    }
  }

  function stopRendering() {
    if (frame) {
      cancelAnimationFrame(frame)
    }
    frame = null
  }

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
  }


  function onInGameStatusChange(status) {
    if (status === true) {
      startRendering()
    } else {
      stopRendering()
    }
  }

  $: onInGameStatusChange($inGameStatus)
  $: if ($connectionStatus === false) {
    stopRendering()
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
    display: block;
  }
</style>