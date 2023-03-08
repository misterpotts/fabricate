<script context="module">
	export const TABS = {};
</script>

<script>
	import { setContext, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';

	const tabs = [];
	const panels = [];
	const selectedTab = writable(null);
	const selectedPanel = writable(null);

	let clazz = '';
	export {clazz as class};

	const tabOperations = {
		registerTab: tab => {
			tabs.push(tab);
			selectedTab.update(current => current || tab);

			onDestroy(() => {
				const i = tabs.indexOf(tab);
				tabs.splice(i, 1);
				selectedTab.update(current => current === tab ? (tabs[i] || tabs[tabs.length - 1]) : current);
			});
		},

		registerPanel: panel => {
			panels.push(panel);
			selectedPanel.update(current => current || panel);

			onDestroy(() => {
				const i = panels.indexOf(panel);
				panels.splice(i, 1);
				selectedPanel.update(current => current === panel ? (panels[i] || panels[panels.length - 1]) : current);
			});
		},

		selectTab: tab => {
			const i = tabs.indexOf(tab);
			selectedTab.set(tab);
			selectedPanel.set(panels[i]);
		},

		selectPreviousTab: () => {
			const i = tabs.indexOf(selectedTab);
			if (i === 0) {
				return;
			}
			const previous = i - 1;
			selectedTab.set(tabs[previous]);
			selectedPanel.set(panels[previous]);
		},

		selectedTab,
		selectedPanel
	};

	export const selectPreviousTab = tabOperations.selectPreviousTab;
	setContext(TABS, tabOperations);

</script>

<div class="fab-tabs {clazz}">
	<slot></slot>
</div>