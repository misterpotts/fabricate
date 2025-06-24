<script lang="ts">

    /*
     * ===========================================================================
     * Imports
     * ===========================================================================
     */

    import {Avatar} from "@skeletonlabs/skeleton-svelte";

</script>

<div class="card snap-start h-full bg-surface-700 flex flex-row col-span-1 row-span-1">
    <Avatar alt="Loading item..." initials="?" width="w-24" rounded="rounded-r-none rounded-l-md" />
    <div class="flex flex-col w-2/3 p-2">
        <div class="placeholder rounded-xl w-2/3 h-4 mb-2 animate-pulse"></div>
        <div class="placeholder rounded-xl w-3/4 h-2 mt-2 animate-pulse"></div>
        <div class="placeholder rounded-xl w-4/4 h-2 mt-2 animate-pulse"></div>
        <div class="placeholder rounded-xl w-3/4 h-2 mt-2 animate-pulse"></div>
    </div>
</div>
