<script>
  import { writable } from 'svelte/store'
  import { getContext } from 'svelte'

  import Dialog from './Dialog.svelte'
  import { inGameStatus } from './store.js'

  export let client

  const { open } = getContext('simple-modal')

  const modalErrorMsg = writable("")

  const play = async () => {
    try {
      await enterGame()
    } catch (e) {
      $modalErrorMsg = e.message
      return false
    }
    return true
  }

  async function enterGame() {
    await client.remoteCall('enter_game')
    $inGameStatus = true
  }

  export function openDialog() {
    open(
      Dialog,
      {
        message: "Enter player name",
        modalErrorMsg,
        play
      },
      {
        closeButton: false,
        closeOnEsc: false,
        closeOnOuterClick: false,
      }
    )
  }

  export function openGameOverMenu() {
    open(
      Dialog,
      {
        message: "Oops... you died! 😭",
        modalErrorMsg,
        play
      },
      {
        closeButton: false,
        closeOnEsc: false,
        closeOnOuterClick: false,
      }
    )
  }


  openDialog()

  $: if ($inGameStatus === false) {
    openGameOverMenu()
  }


</script>
