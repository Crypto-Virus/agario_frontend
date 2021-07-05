<script>
  import { onMount, afterUpdate } from 'svelte'
  import { Client } from './client'
  import Canvas, { context } from './Canvas.svelte'
  import render from './render.js'
  import config from './config.js'
  import Modal from './Modal.svelte'
  import Core from './Core.svelte'
  import { width, height, connectionStatus, inGameStatus } from './store.js'
  import { Jumper } from 'svelte-loading-spinners'

  let playerPos = {x: 0, y: 0}
  let gameData = {}
  let target
  let setTargetInterval
  let targetUpdated = false
  let core


  const client = new Client('ws://192.168.1.52:8080')
  client.connect()
  client.handleNotifications['update'] = handleUpdate
  client.handleNotifications['pong'] = () => {}
  client.handleNotifications['notify_game_over'] = () => {$inGameStatus = false}

  function startGame() {
    setTargetInterval = setInterval(() => {
      if ($connectionStatus && $inGameStatus && targetUpdated) {
        client.notify("target", target)
        targetUpdated = false
      }
    }, 1000/60)
  }

  function stopGame() {
    if (setTargetInterval) {
      clearInterval(setTargetInterval)
    }
  }

  function handleUpdate(data) {
    // update inGame status incase we missed game started notification
    playerPos.x = data.x
    playerPos.y = data.y
    gameData = data
  }

  function renderFrame() {
    render.renderUpdate(context, gameData, $width, $height)
  }


  function onMouseMove(event) {
    if ($connectionStatus && $inGameStatus) {
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
      if ($connectionStatus && $inGameStatus) {
        client.notify('split')
      }
    }
  }


  // setInterval(() => {
  //   if (client.connected()) {
  //     client.notify('ping')
  //   }
  // }, 1000)

  function onInGameStatusChange(status) {
    if (status === true) {
      startGame()
    } else {
      stopGame()
    }
  }

  function onConnectionStatusChange(status) {
    if (status === false) {
      stopGame()
    }
  }

  $: onInGameStatusChange($inGameStatus)
  $: onConnectionStatusChange($connectionStatus)
</script>


<svelte:window on:keydown={onKeyDown} on:mousemove={onMouseMove} ></svelte:window>
<Modal>
  <Core bind:this={core} {client}/>
  <Canvas render={renderFrame}></Canvas>
</Modal>



<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

</style>