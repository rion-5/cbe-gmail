<script lang="ts">
  export let logs: string[];
</script>

<div class="bg-white p-6 rounded-lg shadow">
  <h2 class="text-xl font-semibold mb-4">Logs</h2>
  <div class="h-40 overflow-y-auto bg-gray-50 p-4 rounded-md">
    {#each logs as log}
      <p class="text-sm text-gray-700">{log}</p>
    {/each}
  </div>
</div>