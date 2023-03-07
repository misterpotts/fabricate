<script lang="ts">
    import Properties from "../../scripts/Properties";
    import {ICON_NAMES} from "../FontAwesomeIcons";
    import {clickOutside} from "../common/ClickOutside";
    import {createEventDispatcher, getContext} from "svelte";
    import {key} from "./CraftingSystemManagerApp";

    const dispatch = createEventDispatcher();

    const {
        localization
    } = getContext(key);

    const solidCssClasses = ICON_NAMES
        .map(iconCode => `fa-solid fa-${iconCode}`);
    const regularCssClasses = ICON_NAMES
        .map(iconCode => `fa-regular fa-${iconCode}`);
    const allIcons = solidCssClasses.concat(regularCssClasses);

    let visible = false;
    let essence = null;
    let x = 0;
    let y = 0;

    let iconCodeSearch = "";
    let icons = allIcons;

    function searchIcons(target) {
        const predicate = iconName => iconName.search(new RegExp(target, "i")) >= 0;
        return allIcons.filter(predicate);
    }

    function hide() {
        visible = false;
    }

    export const show = (event, essence) => {
        positionAndReveal(event, essence);
    }

    function positionAndReveal(event, selectedEssence) {
        essence = selectedEssence;
        const svelteApplication = Object.values(ui.windows)
            .find(w => w.id === Properties.ui.apps.craftingSystemManager.id);
        const { left, top } = svelteApplication.position;
        const { clientX, clientY } = event;
        y =  clientY - top;
        x = clientX - left;
        visible = true;
    }

    function iconSelected(essence, iconCode) {
        dispatch("iconSelected", {
            essence,
            iconCode
        });
    }

</script>

{#if visible}
    <div class="fab-essence-icon-modal"
         style={`top: ${y}px; left:${x}px;`}
         use:clickOutside
         on:clickOutside={hide}>
        <input type="text"
               bind:value={iconCodeSearch}
               on:input={() => icons = searchIcons(iconCodeSearch)}
               placeholder={localization.localize(`${Properties.module.id}.CraftingSystemManagerApp.tabs.essences.modal.searchPlaceholder`)} />
        <div class="fab-scrollable fab-essence-icon-opts">
            {#each icons as css}
                <button on:click={iconSelected(essence, css)}>
                    <i class="{css}"></i>
                </button>
            {/each}
        </div>
    </div>
{/if}