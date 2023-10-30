<script lang="ts">
  import { swaClient } from '../App.svelte'
  let count: number = 0
  const increment = () => {
    count += 1
    swaClient.v1.analyticsTrack("svelte", count, "test")
  }
</script>

<button on:click={increment}>
  count is {count}
</button>
