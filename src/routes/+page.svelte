<script lang="ts">
  import { onMount } from 'svelte';
  import EmailForm from '$lib/components/EmailForm.svelte';
  import LogDisplay from '$lib/components/LogDisplay.svelte';
  import type { Recipient } from '$lib/types';

  import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

  let recipients: Recipient[] = [];
  let logs: string[] = [];
  let isAuthenticated = false;
  let gmailUser = '';

  let userId: string | null;
	let userName: string | null;

  onMount(async () => {
    userId = $auth.id_no;
		userName = $auth.user_name;
    //gmail에 대한 인증
    if (isAuthenticated) return; // 이미 인증된 경우 중복 호출 방지
    const response = await fetch('/api/oauth-google/status');
    const data = await response.json();
    isAuthenticated = data.authenticated;
    gmailUser = data.gmailUser || 'Unknown';
    if (!isAuthenticated) {
      window.location.href = '/api/oauth-google/login';
    }

    // Load initial logs
    try {
      const logResponse = await fetch('/api/logs');
      if (logResponse.ok) {
        logs = (await logResponse.json()).logs;
      } else {
        logs = ['Failed to load logs'];
      }
    } catch (error) {
      logs = [`Error loading logs: ${(error as Error).message}`];
    }
  });


  async function handleCsvUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const formData = new FormData();
      formData.append('csv', input.files[0]);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      recipients = data.recipients;
      logs = [...logs, `Uploaded CSV with ${recipients.length} recipients`];
    }
  }

  async function handleSendEmail({
    subject,
    content,
    contentType,
    image,
  }: {
    subject: string;
    content: string;
    contentType: 'text' | 'html';
    image?: File;
  }) {
    for (const recipient of recipients) {
      console.log(`Attempting to send email to ${recipient.email}`);
      const formData = new FormData();
      formData.append('to', recipient.email);
      formData.append('name', recipient.name);
      formData.append('subject', subject);
      formData.append('content', content);
      formData.append('contentType', contentType);
      if (image) formData.append('image', image);

      try {
        const response = await fetch('/api/send', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        logs = [...logs, `Sent to ${recipient.email}: ${result.message}`];
        console.log(`Success: Sent to ${recipient.email}`);
      } catch (error) {
        const err = error as Error;
        logs = [...logs, `Failed to send to ${recipient.email}: ${err.message}`];
        console.error(`Error: Failed to send to ${recipient.email}`, error);
      }
      await new Promise(resolve => setTimeout(resolve, 300)); // 0.3초 딜레이
    }
  }
</script>

{#if isAuthenticated}
  <div class="space-y-6">
        <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Sender Account</h2>
      <p class="text-gray-600">Sending emails from: {gmailUser}</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Upload Recipients (CSV)</h2>
      <input
        type="file"
        accept=".csv"
        on:change={handleCsvUpload}
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {#if recipients.length > 0}
        <p class="mt-2 text-gray-600">{recipients.length} recipients loaded</p>
      {/if}
    </div>

    <EmailForm on:send={e => handleSendEmail(e.detail)} />

    <LogDisplay {logs} />
  </div>
{:else}
  <p class="text-center text-gray-600">Authenticating...</p>
{/if}