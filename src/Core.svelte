<script>
  import { writable } from 'svelte/store'
  import { getContext } from 'svelte'

  import Dialog from './Dialog.svelte'

  export let client

  const { open } = getContext('simple-modal')

  const modalErrorMsg = writable("")

  const onOkay = (text) => {
    try {
      enterGame(text)
    } catch (e) {
      $modalErrorMsg = e.message
      return false
    }
    return true
  }

  function enterGame(playerName) {
    console.assert(playerName, "Player name cannot be empty")
    client.notify('enter_game', {player_name: playerName})
  }

  export function openMainMenu() {
    open(
      Dialog,
      {
        message: "Enter player name",
        modalErrorMsg,
        hasForm: true,
        onOkay
      },
      {
        closeButton: false,
        closeOnEsc: false,
        closeOnOuterClick: false,
      }
    )
  }


  openMainMenu()





</script>
