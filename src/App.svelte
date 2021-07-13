<script>
  import { Client } from './client'
  import Canvas from './Canvas.svelte'
  import Camera from './Camera.svelte'
  import Background from './Background.svelte'
  import FoodCells from './FoodCells.svelte'
  import PlayerCells from './PlayerCells.svelte'
  import FPS from './FPS.svelte'
  import Scoreboard from './Scoreboard.svelte'
  import Modal from './Modal.svelte'
  import Core from './Core.svelte'
  import {connectionStatus, inGameStatus, gameData, scores} from './store.js'



  let smoothCameraVisibilty = 0.01
  let currentVisible
  let target
  let setTargetInterval
  let targetUpdated = false
  let core



  const client = new Client('ws://192.168.1.52:8080')
  client.connect()
  client.handleNotifications['pong'] = () => {}
  client.handleNotifications['notify_update_metadata'] = (metadata) => {
    const scores_ = metadata.scores
    if (scores_) {
      $scores = scores_
    }
  }
  client.handleNotifications['notify_game_over'] = () => {
    $inGameStatus = false
    currentVisible = null
  }
  client.handleBinaryNotifications[0] = (dataView) => {
    // handle camera updates for first 12 bytes
    gameData.position = {
      x: dataView.getFloat32(0, true),
      y: dataView.getFloat32(4, true),
    }
    gameData.visible = dataView.getFloat32(8, true);
    gameData.topLeft = {
      x: gameData.position.x - gameData.visible / 2,
      y: gameData.gameHeight - gameData.position.y - gameData.visible / 2,
    }

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
    gameData.cells = cells
  }

  client.handleBinaryNotifications[1] = (dataView) => {
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
    gameData.food = cells
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

  function onMouseMove(event) {
    if ($connectionStatus && $inGameStatus) {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const dx =  event.clientX - centerX
      const dy = (window.innerHeight - event.clientY) - centerY
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

  <Canvas>
    <Camera>
      <Background/>
      <FoodCells/>
      <PlayerCells/>
    </Camera>
    <FPS/>
    <Scoreboard/>
  </Canvas>

</Modal>



<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

</style>