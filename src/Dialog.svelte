<script>
  import { getContext } from 'svelte';
  export let message;
  export let modalErrorMsg;
	export let hasForm = false;
	export let onOkay = () => {};

  const { close } = getContext('simple-modal');

	let value;
	let onChange = () => {};

	function _onOkay() {
		if (onOkay(value)) {
      close();
    }
	}

	$: onChange(value)
</script>


<h2>{message}</h2>

{#if hasForm}
	<input
    type="text"
	  bind:value
	  on:keydown={e => e.which === 13 && (value) && _onOkay()} />
{/if}

<div class="buttons">
	<button on:click={_onOkay} disabled={!value}>
		Play
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