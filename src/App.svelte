<!--
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
-->

<!--
    Handles and coordinates all global aspects of the app.
-->
<script>
    import { onMount } from "svelte";
    import Overlay from '@components/Overlay.svelte'
    import Viewer from '@components/Viewer.svelte';
    import { intro } from './contentstore.js';


    let content;
    let isArAvailable;
    let showIntro;
    let viewer;


    /**
     * Initial setup of the viewer. Called after the component is first rendered to the DOM.
     */
    onMount(() => {
        // TODO: Check if AR is available
        isArAvailable = true

        // TODO: Determine if intro was already shown before
        showIntro = true;
        content = intro;
    })

    /**
     * Initiate start of AR session
     */
    function startAr() {
        showIntro = false;

        // TODO: Start initialisation of the viewer
        viewer.startAr();
    }
</script>


{#if showIntro}
    <Overlay content="{content}" withFooter="{isArAvailable}" on:okAction={startAr} />
{/if}

<Viewer bind:this={viewer}/>