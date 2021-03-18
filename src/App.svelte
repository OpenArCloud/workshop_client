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

    import { ARMODES } from '@src/core/common'
    import { getCurrentLocation } from '@src/core/locationTools'

    import Dashboard from '@components/Dashboard.svelte';
    import Overlay from '@components/Overlay.svelte'
    import Viewer from '@components/Viewer.svelte';

    import { arIsAvailable, showDashboard, hasIntroSeen, initialLocation, ssr, arMode } from './stateStore';
    import { info, intro, arOkMessage, noArMessage, outro, startedOkLabel, doitOkLabel,
        markerInfo} from './contentStore';


    let showWelcome, showOutro, showMarkerInfo;
    let dashboard, viewer;
    let shouldShowDashboard, shouldShowMarkerInfo, activeArMode;

    $: showAr = $arIsAvailable && !showWelcome && !shouldShowDashboard && !shouldShowMarkerInfo && !showOutro;

    /**
     * Reactive function to setup AR modes.
     *
     * Will be called everytime the value in arIsAvailable changes
     */
    $: {
        if ($arIsAvailable) {
            getCurrentLocation()
                .then((currentLocation) => {
                    $initialLocation = currentLocation;
                    return getServicesAtLocation(currentLocation.regionCode, currentLocation.h3Index)
                })
                .then(services => {
                    if ($arMode === ARMODES.auto) {
                        if (services.length !== 0) {
                            $ssr = services;
                            activeArMode = ARMODES.oscp;
                        } else {
                            activeArMode = ARMODES.marker
                            shouldShowMarkerInfo = true;
                        }
                    } else {
                        activeArMode = $arMode;
                    }
                })
                .catch(error => {
                    // TODO: Inform user
                    console.log(error);
                });
        }
    }


    /**
     * Initial setup of the viewer. Called after the component is first rendered to the DOM.
     */
    onMount(() => {
        // AR sessions need to be started by user action, so welcome dialog (or the dashboard) is always needed
        showWelcome = true;
        showOutro = false;

        // Delay close of dashboard until next request
        shouldShowDashboard = $showDashboard;
    })

    /**
     * Decides what's next after the intro is closed by the user.
     *
     * When discovery services are available at the current location of the user, AR will start or the dashboard is
     * shown.
     *
     * When there are no discovery services available, another dialog is shown, informing the user about the marker
     * alternative.
     */
    function closeIntro() {
        $hasIntroSeen = true;
        showWelcome = false;
        showOutro = false;
        showMarkerInfo = shouldShowMarkerInfo;

        if (!shouldShowDashboard && !showMarkerInfo) {
            startAr();
        }
    }

    /**
     * Handles closing the dialog with information about how to use markers.
     */
    function closeMarker() {
        shouldShowMarkerInfo = false;
        closeIntro();
    }

    /**
     * Initiate start of AR session
     */
    function startAr() {
        // TODO: Start initialisation of the viewer
        shouldShowDashboard = false;
        showOutro = false;

        tick().then(() => viewer.startAr());
    }

    /**
     * AR session was closed by 'go to previous page' action.
     *
     * Show dashboard if requested and show dialog to reenter AR session.
     */
    function sessionEnded() {
        showOutro = true;
        shouldShowDashboard = $showDashboard;
    }
</script>


<!-- TODO: Replace generic Overlay components with specific content components -->
{#if shouldShowDashboard && $arIsAvailable}
    <Dashboard bind:this={dashboard} on:okClicked={startAr} />
{/if}

{#if showWelcome}
    <Overlay withOkFooter="{$arIsAvailable && activeArMode !== ARMODES.auto}" okButtonLabel="{$startedOkLabel}" on:okAction={closeIntro}>
        <div slot="content">{@html $hasIntroSeen ? $info : $intro}</div>
        <div slot="message">{@html $arIsAvailable ? $arOkMessage : $noArMessage}</div>
    </Overlay>

{:else if showOutro}
    <Overlay withOkFooter="{true}" okButtonLabel="{$doitOkLabel}" on:okAction={closeIntro}>
        <div slot="content">{@html $outro}</div>
    </Overlay>

{:else if shouldShowMarkerInfo}
    <Overlay withOkFooter="{true}" okButtonLabel="{$doitOkLabel}" on:okAction={closeMarker}>
        <div slot="content">{@html $markerInfo}</div>
    </Overlay>

{:else if showAr}
    <Viewer bind:this={viewer} activeArMode="{activeArMode}" on:arSessionEnded={sessionEnded} />
{/if}
