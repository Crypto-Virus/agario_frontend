<script>
  import { onMount } from 'svelte'
  import { Client } from './client'
  import Canvas, { canvas, context } from './Canvas.svelte'
  import render from './render.js'
  import config from './config.js'


  let player_cells = []
  let food_cells = []
  let playerName = ''
  let playerPos = {x: 0, y: 0}
  let gameData
  let inGame = false

  const client = new Client('ws://127.0.0.1:8080')
  client.connect()
  client.handleNotifications['update'] = handleUpdate
  client.handleNotifications['pong'] = () => {}
  client.handleNotifications['notify_game_started'] = () => {inGame = true}
  client.handleNotifications['notify_game_over'] = () => {inGame = false}


  function handleUpdate(data) {
    // update inGame status incase we missed game started notification
    inGame = true
    playerPos.x = data.x
    playerPos.y = data.y
    gameData = data
  }

  function renderFrame() {
    render.renderUpdate(context, gameData)
  }

  function onMouseMove(event) {
    if (client.connected() && inGame) {
      var canvasRect = canvas.getBoundingClientRect();
      const canvasX = event.clientX - canvasRect.left
      const canvasY = config.screenHeight - (event.clientY - canvasRect.top)
      const originX = playerPos.x - config.screenWidth / 2
      const originY = playerPos.y - config.screenHeight / 2
      const x = originX + canvasX
      const y = originY + canvasY
      client.notify(
        'target',
        {
          x: x,
          y: y,
        }
      )
    }
  }

  function onKeyDown(event) {
    if (event.keyCode === 32) {
      if (client.connected() && inGame) {
        client.notify('split')
      }
    }
  }


  function onPlay() {
    client.notify('enter_game', {player_name: playerName})
  }

  setInterval(() => {
    if (client.connected()) {
      client.notify('ping')
    }
  }, 1000)

</script>

<!-- <svelte:window on:keydown={onKeyDown} on:mousemove={onMouseMove} ></svelte:window> -->
<!-- <input type="text" bind:value={playerName}> -->
<!-- <button disabled={!playerName} on:click={onPlay}>Play</button> -->
<!-- <br> -->
<Canvas render={renderFrame}></Canvas>


<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>