<!-- src/routes/login/+page.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { login } from '$lib/api/login/login';
	import type { LoginParam } from '$lib/types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	let loginId = '';
	let password = '';
	let error: string | null = null;
	let loginIdInput: HTMLInputElement;
	let passwordInput: HTMLInputElement;

	onMount(() => {
		loginIdInput.focus();
	});

	async function handleLogin() {
		if (!loginId) {
			error = 'Please enter your Student ID';
			loginIdInput.focus();
			return;
		}

		if (!password) {
			error = 'Please enter your Password';
			passwordInput.focus();
			return;
		}

		const params: LoginParam = { loginId, password };

		try {
			const result = await login(params);
			const dept_code = result.data?.parentDept?.code;
			const patron_state = result.data?.patronState?.id;
			// console.log(JSON.stringify(result, null, 2));
			if (
				result.success &&
			  (dept_code === 'Y0000502' || dept_code === 'Y0001097') &&
			  [1, 2, 8, 9, 13, 15, 16].includes(patron_state)) {
			// if (result.success) {   //test

				auth.set({
					isLoggedIn: true,
					user_name: result.data.name,
					id_no: result.data.memberNo
				});
				// 서버에 세션 설정 요청
				await fetch('/api/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id_no: result.data.memberNo,
						user_name: result.data.name
					})
				});
				error = null;

				const $page = get(page);
				const target = $page.url.searchParams.get('redirect') || '/';
				goto(target);
			} else {
				loginId = '';
				password = '';
				error =
					result.success
						? 'Access restricted to College of Business and Economics members only'
						: result.message;
				loginIdInput.focus();
			}
		} catch (err) {
			loginId = '';
			password = '';
			loginIdInput.focus();
			error = err instanceof Error ? err.message : 'An unexpected error occurred';
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			if (!loginId) {
				loginIdInput.focus();
				return;
			}
			if (!password) {
				passwordInput.focus();
				return;
			}
			handleLogin();
		}
	}
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<main class="flex min-h-screen items-start justify-center bg-gray-50">
	<div class="login-box mt-24 w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
		<h1
			class="mb-6 text-center text-4xl font-bold text-indigo-900"
			style="font-family: 'Playfair Display', serif;"
		>
			CBE GMAIL
		</h1>
		<h2
			class="mb-6 text-center text-xl font-semibold text-gray-700"
			style="font-family: 'Montserrat', sans-serif;"
		>
			Login
		</h2>
		<input
			class="mb-4 w-full rounded-lg border border-gray-200 p-3 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
			type="text"
			placeholder="Student ID"
			bind:this={loginIdInput}
			bind:value={loginId}
			onkeydown={handleKeydown}
			style="font-family: 'Montserrat', sans-serif;"
		/>
		<input
			class="mb-6 w-full rounded-lg border border-gray-200 p-3 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
			type="password"
			placeholder="Portal Password"
			bind:this={passwordInput}
			bind:value={password}
			onkeydown={handleKeydown}
			style="font-family: 'Montserrat', sans-serif;"
		/>
		<button
			class="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white transition duration-300 hover:bg-indigo-700"
			onclick={handleLogin}
			style="font-family: 'Montserrat', sans-serif;"
		>
			Login
		</button>
		{#if error}
			<p
				class="mt-4 text-center text-sm text-red-500"
				style="font-family: 'Montserrat', sans-serif;"
			>
				{error}
			</p>
		{/if}
	</div>
</main>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.login-box {
		animation: fadeIn 0.5s ease-out;
	}
</style>
