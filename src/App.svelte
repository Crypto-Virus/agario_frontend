<script>
  import { onMount, afterUpdate } from 'svelte'
  import { Client } from './client'
  import Canvas, { canvas, context } from './Canvas.svelte'
  import render from './render.js'
  import config from './config.js'
  import Modal from './Modal.svelte'
  import Core from './Core.svelte'
  import { width, height } from './store.js'


  let player_cells = []
  let food_cells = []
  let playerPos = {x: 0, y: 0}
  let gameData
  let inGame = false
  let target
  let mouseInterval
  let targetUpdated = false

  const gameStarted = () => {
    inGame = true
    mouseInterval = setInterval(() => {
      if (client.connected() && inGame && target && targetUpdated) {
        client.notify("target", target)
        targetUpdated = false
      }
    }, 1000/60)
  }

  const gameOver = () => {
    inGame = false
    if (mouseInterval) {
      clearInterval(mouseInterval)
    }
  }

  const client = new Client('ws://192.168.1.52:8080')
  client.connect()
  client.handleNotifications['update'] = handleUpdate
  client.handleNotifications['pong'] = () => {}
  client.handleNotifications['notify_game_started'] = gameStarted
  client.handleNotifications['notify_game_over'] = gameOver


  function handleUpdate(data) {
    // update inGame status incase we missed game started notification
    inGame = true
    playerPos.x = data.x
    playerPos.y = data.y
    gameData = data
  }

  function renderFrame() {
    render.renderUpdate(context, gameData, $width, $height)
  }


  function onMouseMove(event) {
    if (client.connected() && inGame) {
      const centerX = $width / 2
      const centerY = $height / 2
      const dx =  event.clientX - centerX
      const dy = ($height - event.clientY) - centerY
      target = {
        x: dx,
        y: dy,
      }
      targetUpdated = true
    }
  }


  function onKeyDown(event) {
    if (event.keyCode === 32) {
      if (client.connected() && inGame) {
        client.notify('split')
      }
    }
  }


  setInterval(() => {
    if (client.connected()) {
      client.notify('ping')
    }
  }, 1000)



</script>


<svelte:window on:keydown={onKeyDown} on:mousemove={onMouseMove} ></svelte:window>
<Modal>
  <Core {client}/>
  <Canvas render={renderFrame}></Canvas>
</Modal>



<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>