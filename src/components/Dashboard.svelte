<!--
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
-->

<!--
    This component displays the internals of the app, and allows to change them when possible.
-->
<script>
    import { createEventDispatcher } from 'svelte';

    import { supportedCountries} from 'ssd-access';

    import { showDashboard, initialLocation, availableGeoPoseServices, availableContentServices,
        availableP2pServices, selectedGeoPoseService, selectedContentService, selectedP2pService, arMode,
        currentMarkerImage, currentMarkerImageWidth, recentLocalisation, debug_appendCameraImage,
        debug_showLocationAxis, debug_useLocalServerResponse, allowP2pNetwork, p2pNetworkState
        } from '@src/stateStore';

    import { ARMODES } from '@core/common';


    // Used to dispatch events to parent
    const dispatch = createEventDispatcher();
</script>


<style>
    button {
        margin: 50px;
    }
</style>


<!-- TODO: Extract strings to contentStore -->


<button on:click={() => dispatch('okClicked')}>Go immersive</button>


<h2>Application state</h2>

<div>
    <input id="showagain" type="checkbox" bind:checked={$showDashboard} />
    <label for="showagain">Show Dashboard next time</label>
</div>

<dl>
    <dt>H3Index</dt>
    <dd>{$initialLocation.h3Index}</dd>
    <dt>Country</dt>
    <dd>{$initialLocation.countryCode}</dd>
    <dt>OSCP Region</dt>
    <!--  TODO: Might make sense to do some validation here  -->
    <dd><input list="supported-countries" bind:value={$initialLocation.regionCode} /></dd>
</dl>

<dl>
    <dt>AR mode</dt>
    <dd>
        <input id="armodeoscp" type="radio" bind:group={$arMode} value="{ARMODES.oscp}"
               disabled="{$availableGeoPoseServices.length === 0  || null}"/>
        <label for="armodeoscp">{ARMODES.oscp}</label>
    </dd>
    <dd>
        <input id="armodemarker" type="radio" bind:group={$arMode} value="{ARMODES.marker}" />
        <label for="armodemarker">{ARMODES.marker}</label>
    </dd>
    <dd>
        <input id="armodeauto" type="radio" bind:group={$arMode} value="{ARMODES.auto}" />
        <label for="armodeauto">{ARMODES.auto}</label>
    </dd>
</dl>

<dl>
    <dt>GeoPose Server</dt>
    <dd><select bind:value={$selectedGeoPoseService} disabled="{$availableGeoPoseServices.length < 2  || null}">
        {#if $availableGeoPoseServices.length === 0}
            <option>None</option>
        {:else}
            {#each $availableGeoPoseServices as service}
                <option value={service}>{service.title}</option>
            {/each}
        {/if}
    </select></dd>
</dl>

<dl>
    <dt>Recent GeoPose</dt>
    <dd><pre>{JSON.stringify($recentLocalisation.geopose, null, 2)}</pre></dd>
<!--    TODO: Values aren't displayed for some reason. Fix. -->
<!--    <dt>at</dt>-->
<!--    <dd><pre>{JSON.stringify($recentLocalisation.localpose, null, 2)}</pre></dd>-->
</dl>

<dl>
    <dt>Content Server</dt>
    <dd><select bind:value={$selectedContentService} disabled="{$availableContentServices.length < 2  || null}">
        {#if $availableContentServices.length === 0}
            <option>None</option>
        {:else}
            {#each $availableContentServices as service}
                <option value={service}>{service.title}</option>
            {/each}
        {/if}
    </select></dd>
</dl>

<dl>
    <dt>P2P Service</dt>
    <dd><select bind:value={$selectedP2pService} disabled="{$availableP2pServices.length < 2  || null}">
        {#if $availableP2pServices.length === 0}
            <option>None</option>
        {:else}
            {#each $availableP2pServices as service}
                <option value={service}>{service.title}</option>
            {/each}
        {/if}
    </select></dd>
</dl>

<dl>
    <dt>Marker image</dt>
    <dd>{$currentMarkerImage}</dd>
    <dt>Width</dt>
    <dd><input type="number" bind:value={$currentMarkerImageWidth} />m</dd>
</dl>

<p>Headless available (y/n)</p>

<div>
    <input id="allowP2p" type="checkbox" bind:checked={$allowP2pNetwork} />
    <label for="allowP2p">Connect to local p2p network</label>
    <p>{$p2pNetworkState}</p>
</div>

<h2>Debug settings</h2>

<div>
    <input id="appendcameraimage" type="checkbox" bind:checked={$debug_appendCameraImage} />
    <label for="appendcameraimage">Append captured image</label>
</div>

<div>
    <input id="showlocationaxis" type="checkbox" bind:checked={$debug_showLocationAxis} />
    <label for="showlocationaxis">Show local zero point markers</label>
</div>

<div>
    <input id="uselocalserverresponse" type="checkbox" bind:checked={$debug_useLocalServerResponse} />
    <label for="uselocalserverresponse">Use local server response</label>
</div>


{@html supportedCountries}
