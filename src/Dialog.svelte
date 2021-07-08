<script>
  import { getContext } from 'svelte';
  import { Circle3 } from 'svelte-loading-spinners'
  import { connectionStatus } from './store.js'

  export let message = "Click to Play";
  export let modalErrorMsg;
  export let play = () => {};

  const { close } = getContext('simple-modal');

  async function _play() {
    if (await play()) {
      close();
    }
  }

</script>


{#if !$connectionStatus}
<div class="connecting-container">
    <h3>Connecting</h3>
    <Circle3 size="60" color="red" unit="px" duration="1.5s"></Circle3>
  </div>
{:else}
  <h2>{message}</h2>
  <div class="buttons">
    <button on:click={_play}>
      Play
    </button>
  </div>
{/if}

{#if $modalErrorMsg}
<div class="error-container">
  <p>{$modalErrorMsg}</p>
</div>
{/if}



<style>
  h2 {
    font-size: 2rem;
    text-align: center;
  }

  .buttons {
    display: flex;
    justify-content: center;
  }

  button {
    flex-grow: 1;
  }

  .error-container p {
    color: red;
  }

  .connecting-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }


</style>