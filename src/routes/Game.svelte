<script>
  import { onDestroy } from "svelte";
  import { createGame } from "$lib/core";

  const game = createGame();

  onDestroy(() => {
    game.destroy();
  });
</script>

<div class="h-screen w-screen max-w-screen p-10 bg-coffee-bg">
  <div class="h-full w-full border-2 border-coffee-border rounded-lg">

    <!-- Score -->
    <div class="grid grid-cols-3 gap-4 h-[8%] px-7 py-2">
      <div class="flex">
        <p class="my-auto text-2xl font-bold">Attempts: {$game.attempts}</p>
      </div>
      <div class="flex">
        <p class="m-auto text-5xl font-bold">{!$game.gameStarted ? "Click to Begin!" : $game.score}</p>
      </div>
      <div class="flex">
        <p class="my-auto ml-auto text-2xl font-bold">Best Score: {$game.maxScore}</p>
      </div>
    </div>

    <!-- Arena -->
    <div class="w-full h-[89%] flex">
      <div class="m-auto">
        {#each $game.arena as yArena, y}
          <div id="arena-{y}" class="flex">
            {#each yArena as xArena, x}
              <button
                id="item-{y}-{x}"
                on:click={() => game.handleCardClick(x, y)}
                class={`m-1 w-16 h-16 rounded-xl transition ease-in-out duration-100 ${xArena === "" ? "bg-coffee-card" : "bg-coffee-card-active"} hover:bg-coffee-card-hover flex`}>
                {#if xArena !== ""}
                  <img src={xArena} alt="gambar" class="h-full m-auto">
                {/if}
              </button>
            {/each}
          </div>
        {/each}
      </div>
    </div>

    <!-- Timer -->
    <div class="h-[3%] pb-3 px-7" style={`width: ${$game.timerPercentage}%;`}>
      <div class="w-full h-full bg-coffee-border opacity-70 rounded-full"></div>
    </div>

  </div>
</div>
