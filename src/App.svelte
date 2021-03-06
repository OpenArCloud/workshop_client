<!--
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
-->

<!--
    Handles and coordinates all global aspects of the app.
-->
<script>
    import { onMount, tick } from "svelte";

    import { getServicesAtLocation } from 'ssd-access';

    import { getCurrentLocation } from '@src/core/common.js'

    import Dashboard from '@components/Dashboard.svelte';
    import Overlay from '@components/Overlay.svelte'
    import Viewer from '@components/Viewer.svelte';

    import { arIsAvailable, showDashboard, hasIntroSeen, initialLocation, ssr } from './stateStore.js';
    import { info, intro, arOkMessage, noArMessage, outro, startedOkLabel, doitOkLabel } from './contentStore.js';


    let showWelcome, showOutro;
    let dashboard, viewer;

    let shouldShowDashboard;

    $: showAr = $arIsAvailable && !showWelcome && !shouldShowDashboard;


    /**
     * Initial setup of the viewer. Called after the component is first rendered to the DOM.
     */
    onMount(() => {
        // AR sessions need to be started by user action, so welcome dialog (or the dashboard) is always needed
        showWelcome = true;
        showOutro = false;

        // Delay close of dashboard until next request
        shouldShowDashboard = $showDashboard;

        getCurrentLocation()
            .then((currentLocation) => {
                $initialLocation = currentLocation;
                return getServicesAtLocation(currentLocation.regionCode, currentLocation.h3Index)
            })
            .then(services => {
                // TODO: Add main info to store / dashboard
                if (services.length !== 0) {
                    $ssr = services;
                }
                console.log($ssr);
            })
            .catch(error => {
                // TODO: Inform user
                console.log(error);
            });
    })

    /**
     * Close intro dialog and store that the persistently that the intro was seen.
     */
    function closeIntro() {
        $hasIntroSeen = true;
        showWelcome = false;

        if (!shouldShowDashboard) {
            startAr();
        }
    }

    /**
     * Initiate start of AR session
     */
    function startAr() {
        // TODO: Start initialisation of the viewer
        shouldShowDashboard = false;
        showOutro = false;
        showAr = true;

        tick().then(() => viewer.startAr());
    }

    function sessionEnded() {
        showAr = false;
        showOutro = true;
        shouldShowDashboard = $showDashboard;
    }
</script>


{#if shouldShowDashboard && $arIsAvailable}
    <Dashboard bind:this={dashboard} on:okClicked={startAr} />
{/if}

{#if showWelcome}
    <Overlay withOkFooter="{$arIsAvailable}" okButtonLabel="{$startedOkLabel}" on:okAction={closeIntro}>
        <div slot="content">{@html $hasIntroSeen ? $info : $intro}</div>
        <div slot="message">{@html $arIsAvailable ? $arOkMessage : $noArMessage}</div>
    </Overlay>
{/if}

{#if showOutro}
    <Overlay withOkFooter="{true}" okButtonLabel="{$doitOkLabel}" on:okAction={startAr}>
        <div slot="content">{@html $outro}</div>
    </Overlay>
{/if}

{#if showAr && !shouldShowDashboard}
    <Viewer bind:this={viewer} on:arSessionEnded={sessionEnded} />
{/if}
