<script>
  import "$lib/app.css";
  import Game from "./Game.svelte";
  import { CardList } from "$lib/config";
</script>

<svelte:head>
  <title>Simple Memory Game</title>
  {#each CardList as card }
    <link rel="preload" as="image" href={card.img}>
  {/each}
</svelte:head>
<Game />
