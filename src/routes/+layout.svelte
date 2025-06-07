<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import SessionManager from '$lib/components/SessionManager.svelte';
	import { auth, logout } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { get, derived } from 'svelte/store';
	import { browser } from '$app/environment';
	
	let { children } = $props();
	const isLoggedIn = derived(auth, ($auth) => $auth.isLoggedIn);
	// $: isLoggedIn = $auth.isLoggedIn;
	// $: requiresAuth = $page.url.pathname !== '/login';
	const requiresAuth = derived(page, ($page) => $page.url.pathname !== '/login');
	// $: isRoot = $page.url.pathname === '/';
	const isRoot = derived (page, ($page) => $page.url.pathname === '/');

	function handleLogout() {
		logout();
		goto('/login');
	}
	
	// $: console.log($page.data.session);
</script>
<div class="container mx-auto p-4">
	<!-- 상단 네비게이션 -->
	{#if $isLoggedIn && $requiresAuth}
		<div class="flex items-center justify-between px-2 sm:px-4 mb-4">
			<!-- 루트 페이지에서는 Home 버튼 비워둠 -->
			{#if !$isRoot}
			<button onclick={() => goto('/')} class="flex items-center space-x-1 text-sm font-semibold text-gray-800 hover:text-blue-600">
				<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
					<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
				</svg>
				<span>Home</span>
			</button>
			{:else}
				<!-- <div class="text-sm sm:text-base font-semibold text-gray-800">{$auth.user_name} 님</div> -->
			     <div class="flex items-center space-x-1 text-sm font-semibold text-gray-800">
       <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
         <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
       </svg>
       <span>{$auth.user_name} 님</span>
     </div>
				{/if}
			<button class="text-sm text-red-500 hover:underline" onclick={handleLogout}>로그아웃</button>
		</div>
	{/if}

	<!-- 세션 관리 -->
	{#if browser && $requiresAuth}
	<!-- {#if browser } -->
		<SessionManager requiresAuth = {$requiresAuth} />
	{/if}

	<!-- 페이지 콘텐츠 -->
	<!-- <slot /> -->
{@render children()}
</div>

<style>
	:global(.container) {
		max-width: 640px;
	}
</style>
