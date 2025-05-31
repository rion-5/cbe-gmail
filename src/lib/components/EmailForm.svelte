<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  let subject = '';
  let content = '';
  let contentType: 'text' | 'html' = 'text';
  let image: File | null = null;

  function handleSubmit() {
    dispatch('send', { subject, content, contentType, image });
    // Reset form
    subject = '';
    content = '';
    image = null;
  }
</script>

<div class="bg-white p-6 rounded-lg shadow">
  <h2 class="text-xl font-semibold mb-4">Compose Email</h2>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
      <input
        id="subject"
        type="text"
        bind:value={subject}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </div>
    <div>
      <label for="contentType" class="block text-sm font-medium text-gray-700">Content Type</label>
      <select
        id="contentType"
        bind:value={contentType}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="text">Plain Text</option>
        <option value="html">HTML</option>
      </select>
    </div>
    <div>
      <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
      <textarea
        id="content"
        bind:value={content}
        rows="5"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      ></textarea>
    </div>
{#if contentType === 'html'}
      <div>
        <label for="image" class="block text-sm font-medium text-gray-700">Embed Image (Optional)</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          on:change={(e) => {
            const target = e.target as HTMLInputElement;
            if (target && target.files && target.files.length > 0) {
              image = target.files[0];
            } else {
              image = null;
            }
          }}
          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
    {/if}
    <button
      type="submit"
      class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      disabled={!subject || !content}
    >
      Send Emails
    </button>
  </form>
</div>