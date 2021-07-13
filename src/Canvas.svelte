<script context="module">
  import { onMount, getContext } from 'svelte'

  export const canvasKey = Symbol()

  export const renderable = (render) => {
    const api = getContext(canvasKey)
    const element = {
      ready: false,
      mounted: false
    }
    if (typeof render === 'function') element.render = render
    else if (render) {
      if (render.render) element.render = render.render
      if (render.setup) element.setup = render.setup
    }
    api.add(element)
    onMount(() => {
      element.mounted = true
      return() => {
        api.remove(element)
        element.mounted = false
      }
    })
  }
</script>

<script>
  import { setContext } from 'svelte'
  import {inGameStatus, connectionStatus} from './store.js'

  export let killLoopOnError = true;

  let canvas
  let context
  let width = window.innerWidth
  let height = window.innerHeight
  let pixelRatio = window.devicePixelRatio
  let frame
  let listeners = []


  onMount(() => {
    context = canvas.getContext('2d')

    listeners.forEach(async entity => {
      if (entity.setup) {
        let p = entity.setup({context, width, height})
        if (p && p.then) await p
      }
      entity.ready = true
    })
  })

  setContext(canvasKey, {
    add (fn) {
      this.remove(fn)
      listeners.push(fn)
    },
    remove (fn) {
      const idx = listeners.indexOf(fn)
      if (idx >= 0) listeners.splice(idx, 1)
    }
  })

  function render() {
    context.save()
    context.scale(pixelRatio, pixelRatio)
    listeners.forEach(entity => {
      try {
        if (entity.mounted && entity.ready && entity.render) {
          entity.render({context, width, height})
        }
      } catch (err) {
        console.error(err)
        if (killLoopOnError) {
          cancelAnimationFrame(frame)
          console.warn('Animation loop stopped due to an error')
        }
      }
    })
    context.restore()
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


  function handleResize () {
    width = window.innerWidth
    height = window.innerHeight
    pixelRatio = window.devicePixelRatio
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
  width={width * pixelRatio}
  height={height * pixelRatio}
  style="width: {width}px; height: {height}px;"
/>
<svelte:window on:resize|passive={handleResize}/>
<slot></slot>


<style>
  canvas {
    display: block;
  }
</style>