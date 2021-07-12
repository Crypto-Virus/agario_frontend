<script>
  import { Client } from './client'
  import Canvas, { context } from './Canvas.svelte'
  import render from './render.js'
  import Modal from './Modal.svelte'
  import Core from './Core.svelte'
  import { width, height, connectionStatus, inGameStatus, pixelRatio } from './store.js'


  let gameData = {
    position: {x: 0, y: 0},
    visible: 0,
    cells: [],
    food: [],
  }
  let smoothCameraVisibilty = 0.01
  let cameraPosition
  let currentVisible
  let target
  let setTargetInterval
  let targetUpdated = false
  let core

  function lerp(start, end, smooth) {
    return ( 1 - smooth) * start + smooth * end
  }

  const client = new Client('ws://192.168.1.52:8080')
  client.connect()
  // client.handleNotifications['update'] = handleUpdate
  client.handleNotifications['pong'] = () => {}
  client.handleNotifications['notify_game_over'] = () => {
    $inGameStatus = false
    cameraPosition = null
    currentVisible = null
  }

  client.handleBinaryNotifications[0] = (dataView) => {
    // handle camera updates for first 12 bytes
    gameData.position.x = dataView.getFloat32(0, true);
    gameData.position.y = dataView.getFloat32(4, true);
    gameData.visible = dataView.getFloat32(8, true);
    // handle cell updates
    const cell_update_size = 13
    const cells_num = Math.floor((dataView.byteLength - 12) / cell_update_size)
    const cells = []
    for (let i = 0; i < cells_num; i++) {
      const offset = (i * cell_update_size) + 12
      cells.push({
        pos: {
          x: dataView.getFloat32(offset + 0, true),
          y: dataView.getFloat32(offset + 4, true),
        },
        radius: dataView.getFloat32(offset + 8, true),
        hue: dataView.getUint8(offset + 12, true),
      })
    }
    gameData.cells = [cells]
  }

  client.handleBinaryNotifications[1] = (dataView) => {
    console.log(dataView)
    // handle food cell updates
    const cell_update_size = 9
    const cells_num = Math.floor(dataView.byteLength / cell_update_size)
    const cells = []
    for (let i = 0; i < cells_num; i++) {
      const offset = i * cell_update_size
      cells.push({
        pos: {
          x: dataView.getFloat32(offset + 0, true),
          y: dataView.getFloat32(offset + 4, true),
        },
        hue: dataView.getUint8(offset + 8, true),
      })
    }
    gameData.food = [cells]
  }

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

  function renderFrame() {
    if (!currentVisible) {
      currentVisible = gameData.visible
    } else if (Math.abs(currentVisible - gameData.visible) < .1) {
      currentVisible = gameData.visible
    } else {
      currentVisible = lerp(currentVisible, gameData.visible, smoothCameraVisibilty)
    }

    render.renderUpdate(context, gameData, $width, $height, $pixelRatio, gameData.position, currentVisible)
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