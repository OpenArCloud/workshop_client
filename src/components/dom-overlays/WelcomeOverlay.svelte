<!--
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
-->

<!--
    Content of the introduction overlay.
-->

<script>
    import { createEventDispatcher } from 'svelte';

    import { hasIntroSeen, arIsAvailable } from '@src/stateStore';
    import { info, intro, arOkMessage, noArMessage, startedOkLabel } from '@src/contentStore';

    export let withOkFooter = true;


    // Used to dispatch events to parent
    const dispatch = createEventDispatcher();
</script>


<style>
    button {
        width: var(--button-width);
        height: var(--button-height);
        border-radius: var(--ui-radius);
    }
</style>


<div>{@html $hasIntroSeen ? $info : $intro}</div>
<div>{@html $arIsAvailable ? $arOkMessage : $noArMessage}</div>

{#if withOkFooter}
<footer>
    <button on:click={() => dispatch('okAction')}>{$startedOkLabel}</button>
</footer>
{/if}
