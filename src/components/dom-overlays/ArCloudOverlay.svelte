<!--
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
-->

<!-- DOM-overlay on top of AR canvas AR mode is OSCP -->
<script>
    import { createEventDispatcher } from 'svelte';

    import { movePhoneMessage, localizeMessage, localizeLabel, isLocalizingMessage, isLocalizedMessage
    } from '@src/contentStore';


    export let hasPose = false;
    export let isLocalizing = false;
    export let isLocalized = false;

    // Used to dispatch events to parent
    const dispatch = createEventDispatcher();
</script>


<style>
    .spinner {
        height: 50px;
    }


    button {
        width: 100%;
        height: 49px;

        margin-bottom: 27px;

        font-size: 18px;
        font-weight: bold;

        background-color: white;
        border: 2px solid #2E4458;
        border-radius: var(--ui-radius);
    }
</style>


{#if !hasPose}
    <p>{$movePhoneMessage}</p>
{:else if isLocalizing}
    <img class="spinner" alt="Waiting spinner" src="/media/spinner.svg" />
    <p>{$isLocalizingMessage}</p>
{:else if hasPose && !isLocalized}
    <p>{$localizeMessage}</p>
    <button on:click={() => dispatch('startLocalisation')}>{$localizeLabel}</button>
{:else if isLocalized}
    <p>{$isLocalizedMessage}</p>
{/if}

