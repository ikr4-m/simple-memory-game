<script>
  import Moment from "moment";
  import { InitialTimer } from "$lib/config";

  let enableTimer = true;
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
      alert("Lmao you lose.");
    }

    timer = Moment();
  }, 1);
  timerInterval();
</script>

<div class="h-screen w-screen max-w-screen p-10 bg-coffee-bg">
  <div class="h-full w-full border-2 border-coffee-border rounded-lg">

    <!-- Arena -->
    <div class="w-full h-[97%] flex">
      <p class="m-auto text-5xl font-bold" on:click={() => incrementTimer()}>Click to increment timer!</p>
    </div>

    <!-- Timer -->
    <div class="h-[3%] pb-3 px-7" style={`width: ${timerPercentage}%;`}>
      <div class="w-full h-full bg-coffee-border opacity-70 rounded-full"></div>
    </div>

  </div>
</div>
