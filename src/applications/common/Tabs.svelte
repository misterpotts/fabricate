<script context="module">
	export const TABS = {};
</script>

<script>
	import { setContext, onDestroy } from 'svelte';
	import {get, writable} from 'svelte/store';

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

		selectTabAtIndex: (indexFn) => {
			if (tabs.length === 0) return;
			const i = indexFn(tabs.length);
			if (i < 0) {
				selectedTab.set(tabs[0]);
				selectedPanel.set(panels[0]);
				return;
			}
			if (i >= tabs.length) {
				selectedTab.set(tabs[tabs.length - 1]);
				selectedPanel.set(panels[panels.length - 1]);
				return;
			}
			selectedTab.set(tabs[i]);
			selectedPanel.set(panels[i]);
		},

		selectedTab,
		selectedPanel
	};

	export const selectTabAtIndex = tabOperations.selectTabAtIndex;
	setContext(TABS, tabOperations);

</script>

<div class="fab-tabs {clazz}">
	<slot></slot>
</div>