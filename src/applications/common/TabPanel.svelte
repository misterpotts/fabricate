<script>
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';

	const panel = {};
	const { registerPanel, selectedPanel } = getContext(TABS);

	registerPanel(panel);

	let clazz = '';
	export {clazz as class};

</script>

{#if $selectedPanel === panel}
	<div class="fab-tab-content {clazz}">
		<slot></slot>
	</div>
{/if}