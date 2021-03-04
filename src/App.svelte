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

    import StateStore from './stateStore.svelte';
    import { info, intro, arOkMessage, noArMessage, outro, startedOkLabel, doitOkLabel } from './contentstore.js';


    let showIntro;
    let hasIntroSeen;
    let showOutro;

    let showDashboard;
    let showAr;

    let dashboard, viewer;

    $: showAr = StateStore.arIsAvailable && !showIntro && !showDashboard;


    /**
     * Initial setup of the viewer. Called after the component is first rendered to the DOM.
     */
    onMount(() => {
        if (navigator.xr !== undefined || true) {
            navigator.xr.isSessionSupported("immersive-ar")
                .then((available) => StateStore.arIsAvailable = available )
        }

        // AR sessions need to be started by user action, so this dialog is always needed
        showIntro = true;

        showOutro = false;

        // First time intro content might be intro cards
        hasIntroSeen = false;

        // TODO: Determine if dashboard should be shown
        showDashboard = false;
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
        showOutro = false;
        showAr = true;

        tick().then(() => viewer.startAr());
    }

    function sessionEnded() {
        showAr = false;
        showOutro = true;
    }
</script>


{#if showIntro}
    <Overlay withOkFooter="{StateStore.arIsAvailable}" okButtonLabel="{startedOkLabel}" on:okAction={closeIntro}>
        <div slot="content">{@html hasIntroSeen ? info : intro}</div>
        <div slot="message">{@html StateStore.arIsAvailable ? arOkMessage : noArMessage}</div>
    </Overlay>
{/if}

{#if showOutro}
    <Overlay withOkFooter="{true}" okButtonLabel="{doitOkLabel}" on:okAction={startAr}>
        <div slot="content">{@html outro}</div>
    </Overlay>
{/if}

{#if showDashboard && StateStore.arIsAvailable}
    <Dashboard bind:this={dashboard} on:okClicked={startAr} />
{/if}

{#if showAr && !showDashboard}
    <Viewer bind:this={viewer} on:arSessionEnded={sessionEnded} />
{/if}
