<script>
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';

	const tab = {};
	const { registerTab, selectTab, selectedTab } = getContext(TABS);

	registerTab(tab);

	let clazz = '';
	export {clazz as class};
</script>

<button class:fab-selected="{$selectedTab === tab}" class={clazz} on:click="{() => selectTab(tab)}">
	<slot></slot>
</button>