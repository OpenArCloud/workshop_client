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
        selectedGeoPoseService, selectedContentService, arMode, currentMarkerImage,
        currentMarkerImageWidth, recentLocalisation, debug_appendCameraImage } from '@src/stateStore';

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

<div>
    <input id="appendcameraimage" type="checkbox" bind:checked={$debug_appendCameraImage} />
    <label for="appendcameraimage">Append captured image</label>
</div>

<dl>
    <dt>GeoPose Server</dt>
    <dd><select bind:value={$selectedGeoPoseService} disabled="{$availableGeoPoseServices.length === 0  || null}">
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
    <dd><select bind:value={$selectedContentService} disabled="{$availableContentServices.length === 0  || null}">
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
    <dt>Marker image</dt>
    <dd>{$currentMarkerImage}</dd>
    <dt>Width</dt>
    <dd><input type="number" bind:value={$currentMarkerImageWidth} />m</dd>
</dl>

<p>Headless available (y/n)</p>

<div>
    <input id="allowP2p" type="checkbox" checked />
    <label for="allowP2p">Connect to local network</label>
    <p>Connected to p2p network</p>
</div>

<button on:click={() => dispatch('okClicked')}>Go immersive</button>

{@html supportedCountries}
