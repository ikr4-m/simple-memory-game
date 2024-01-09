<script>
  import Moment from "moment";
  import GenerateBlock from "$lib/generateBlock";
  import { InitialTimer } from "$lib/config";

  const Block = new GenerateBlock();
  let enableTimer = false;
  let targetTimer = InitialTimer;
  let timer = Moment();

  $: timerDiff = maxTimer.diff(timer);
  $: maxTimer = Moment().add(targetTimer, 's');
  $: timerPercentage = (timerDiff / (targetTimer * 1000)) * 100;

  const incrementTimer = () => {
    if (!enableTimer) return;
    timer = Moment();
    targetTimer += InitialTimer;
  }

  const timerInterval = () => setInterval(() => {
    if (!enableTimer) return;
    if (timerDiff <= 0) {
      enableTimer = false;
    }

    timer = Moment();
  }, 1);
  timerInterval();

  // TODO: Nanti dihapus, malas
  console.log(Block.arena);
  Block.expandArena();
  console.log(Block.arena);
  Block.expandArena();
  console.log(Block.arena);
  Block.expandArena();
  console.log(Block.arena);
  Block.expandArena();
  console.log(Block.arena);
</script>

<div class="h-screen w-screen max-w-screen p-10 bg-coffee-bg">
  <div class="h-full w-full border-2 border-coffee-border rounded-lg">

    <!-- Score -->
    <div class="grid grid-cols-3 gap-4 h-[8%] px-7 py-2">
      <div class="flex">
        <p class="my-auto text-2xl font-bold">Attempts: 0</p>
      </div>
      <div class="flex">
        <p class="m-auto text-5xl font-bold">696969</p>
      </div>
      <div class="flex">
        <p class="my-auto ml-auto text-2xl font-bold">Best Score: 0</p>
      </div>
    </div>

    <!-- Arena -->
    <div class="w-full h-[89%] flex">
      <p class="m-auto text-5xl font-bold" on:click={() => incrementTimer()}>Click to increment timer!</p>
    </div>

    <!-- Timer -->
    <div class="h-[3%] pb-3 px-7" style={`width: ${timerPercentage}%;`}>
      <div class="w-full h-full bg-coffee-border opacity-70 rounded-full"></div>
    </div>

  </div>
</div>
