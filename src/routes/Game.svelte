<script>
  import Moment from "moment";
  import GenerateBlock from "$lib/generateBlock";
  import { InitialTimer, DelayPunishment } from "$lib/config";

  // Variable for game
  let gameStarted = false;
  let attempts = 0;
  let score = 0;
  let maxScore = 0;

  // Variable for timer
  let enableTimer = false;
  let targetTimer = InitialTimer;
  let startTime = Moment();
  let timer = Moment();

  $: maxTimer = startTime.add(targetTimer, 's');
  $: timerDiff = maxTimer.diff(timer);
  $: timerPercentage = (timerDiff / (targetTimer * 1000)) * 100;
  
  const incrementTimer = () => {
    if (!enableTimer) return;
    timer = Moment();
    startTime = Moment();
    targetTimer += InitialTimer;
  }

  const timerInterval = () => setInterval(() => {
    if (!enableTimer) return;
    if (timerDiff <= 0) finishGame();

    timer = Moment();
  }, 1);

  // Variable for block
  let Block = new GenerateBlock();
  let isAnimated = false;
  let [arena, arenaKey] = Block.getArena();

  const refreshArena = () => {
    [arena, arenaKey] = Block.getArena();
    console.log(arenaKey);
    console.log(arena);
  };

  const expandLevel = () => {
    Block.expandArena();
    incrementTimer();

    // TODO: Hapus nanti abis bikin logic untuk cocokin datanya
    if (Block.reachingLimitLevel) {
      alert("You're done!");
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  const validateCard = async (x, y) => {
    if (!enableTimer) return;
    if (isAnimated) return;
    const valid = Block.validateCard(x, y);

    // If Paired
    if (valid === "paired" || valid === "levelUp") {
      score += Math.floor(timerDiff / 150);
    }
    // If Rejected
    if (valid === "rejected") {
      isAnimated = true;
      refreshArena();
      await new Promise(resolve => setTimeout(resolve, DelayPunishment * 1000));
      Block.closeRejectedCard();
      isAnimated = false;
    }
    // If Level Up
    if (valid === "levelUp") {
      refreshArena();
      enableTimer = false;
      await new Promise(resolve => setTimeout(resolve, 1000));
      enableTimer = true;
      expandLevel();
    }

    refreshArena();
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  const cardClicked = async (x, y) => {
    if (gameStarted && !enableTimer) {
      restartGame();
    } else {
      if (!gameStarted) startGame();
      await validateCard(x, y);
    }
  }

  const startGame = () => {
    if (enableTimer || gameStarted) return;
    score = 0;
    enableTimer = true;
    gameStarted = true;

    timer = Moment();
    startTime = Moment();
    timerInterval();
  }

  const finishGame = () => {
    enableTimer = false;

    attempts++;
    maxScore = score > maxScore ? score : maxScore;
    alert("Finish!");
  }

  const restartGame = () => {
    if (!confirm("Are you want to restart the game?")) return;
    gameStarted = false;
    Block = new GenerateBlock();
    refreshArena();
  }
</script>

<div class="h-screen w-screen max-w-screen p-10 bg-coffee-bg">
  <div class="h-full w-full border-2 border-coffee-border rounded-lg">

    <!-- Score -->
    <div class="grid grid-cols-3 gap-4 h-[8%] px-7 py-2">
      <div class="flex">
        <p class="my-auto text-2xl font-bold">Attempts: {attempts}</p>
      </div>
      <div class="flex">
        <p class="m-auto text-5xl font-bold">{!gameStarted ? "Click to Begin!" : score}</p>
      </div>
      <div class="flex">
        <p class="my-auto ml-auto text-2xl font-bold">Best Score: {maxScore}</p>
      </div>
    </div>

    <!-- Arena -->
    <div class="w-full h-[89%] flex">
      <div class="m-auto">
        {#each arena as yArena, y}
          <div id="arena-{y}" class="flex">
            {#each yArena as xArena, x}
              <button
                id="item-{y}-{x}"
                on:click={async () => await cardClicked(x, y)}
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
    <div class="h-[3%] pb-3 px-7" style={`width: ${timerPercentage}%;`}>
      <div class="w-full h-full bg-coffee-border opacity-70 rounded-full"></div>
    </div>

  </div>
</div>
