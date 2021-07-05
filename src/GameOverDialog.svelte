<script>
  import { getContext } from 'svelte';
  export let message = "Game Over";
  export let modalErrorMsg;
	export let playAgain = () => {};

  const { close } = getContext('simple-modal');

	let onChange = () => {};

	function _playAgain() {
		if (playAgain(value)) {
      close();
    }
	}

</script>


<h2>{message}</h2>

<div class="buttons">
	<button on:click={_playAgain}>
		Play Again
	</button>
</div>

{#if $modalErrorMsg}
<div class="error">
  <p>{$modalErrorMsg}</p>
</div>
{/if}



<style>
  h2 {
		font-size: 2rem;
		text-align: center;
	}

	input {
		width: 100%;
	}

	.buttons {
		display: flex;
		justify-content: center;
	}

  button {
    flex-grow: 1;
  }

  .error p {
    color: red;
  }

</style>