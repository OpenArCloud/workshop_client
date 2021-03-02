<!--
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
-->

<!--
    Handles and coordinates all global aspects of the app.
-->
<script>
    import { onMount } from "svelte";
    import { tick } from 'svelte';

    import Dashboard from '@components/Dashboard.svelte';
    import Overlay from '@components/Overlay.svelte'
    import Viewer from '@components/Viewer.svelte';

    import { intro, arAvailable, arUnavailable } from './contentstore.js';


    let isArAvailable;

    let showIntro;
    let showDashboard;
    let showAr;

    let dashboard;
    let viewer;


    /**
     * Initial setup of the viewer. Called after the component is first rendered to the DOM.
     */
    onMount(() => {
        // TODO: Check if AR is available
        isArAvailable = true

        // TODO: Prepare the data and interactions for the dashboard
        showDashboard = true;

        // TODO: Determine if intro was already shown before
        showIntro = true;
    })

    /**
     * Close intro dialog and store that the persistently that the intro was seen.
     */
    function closeIntro() {
        // TODO: Persist that intro was seen
        showIntro = false;

        if (!showDashboard) {
            startAr();
        }
    }

    /**
     * Initiate start of AR session
     */
    function startAr() {
        // TODO: Start initialisation of the viewer
        showDashboard = false;
        showAr = true;

        tick().then(() => viewer.startAr());
    }
</script>


{#if showIntro}
    <Overlay withOkFooter="{isArAvailable}" on:okAction={closeIntro}>
        <div slot="content">{@html intro}</div>
        <div slot="message">{@html isArAvailable ? arAvailable : arUnavailable}</div>
    </Overlay>
{/if}

{#if showDashboard}
    <Dashboard bind:this={dashboard} on:okClicked={startAr} />
{/if}

{#if !showDashboard && showAr}
    <Viewer bind:this={viewer}/>
{/if}
