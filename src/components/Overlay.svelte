<!--
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
-->

<!--
    Component for overlays, either dialogs over HTML content or as overlays over AR view. Height is variable
    to fit the content.
-->
<script>
    import { createEventDispatcher } from 'svelte';
    import { overlayOkButton } from '../contentstore.js';

    // HTML formatted content, displayed in the upper part of the overlay
    export let content;

    // Defines if the footer is displayed
    export let withOkFooter = true;

    // Used to dispatch events to parent
    const dispatch = createEventDispatcher();
</script>


<style>
    aside {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    button {
        width: var(--button-width);
        height: var(--button-height);
        border-radius: var(--ui-radius);
    }

    footer {
        display: flex;
        justify-content: center;

        margin-top: var(--footer-top-margin);
    }

    #frame {
        width: calc(100vw - 2 * var(--ui-margin));

        max-width: var(--ui-max-width);
        max-height: var(--ui-max-height);

        border-radius: var(--ui-radius);
        border: 1px solid black;
        box-shadow: var(--ui-shadow);

        padding: var(--padding-text);
    }
</style>


<aside>
    <div id="frame">
        <slot name="content" />
        <slot name="message" />

        <footer>
            {#if withOkFooter}
            <button on:click={() => dispatch('okAction')}>
                {overlayOkButton}
            </button>
            {/if}
        </footer>
    </div>
</aside>
