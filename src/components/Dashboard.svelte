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
        selectedGeoPoseService, selectedContentService } from '@src/stateStore.js';


    // Used to dispatch events to parent
    const dispatch = createEventDispatcher();
</script>


<div>
    <input id="showagain" type="checkbox" bind:checked={$showDashboard} />
    <label for="showagain">Show Dashboard next time</label>
</div>

<p>Rough location</p>
<dl>
    <dt>H3Index</dt>
    <dd>{$initialLocation.h3Index}</dd>
    <dt>Region code</dt>
    <!--  TODO: Might make sense to do some validation here  -->
    <dd><input list="supported-countries" bind:value={$initialLocation.regionCode} /></dd>
</dl>

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

<p>Headless available</p>

<div>
    <input id="allowP2p" type="checkbox" checked />
    <label for="allowP2p">Connect to local network</label>
    <p>Connected to p2p network</p>
</div>

<button on:click={() => dispatch('okClicked')}>Go immersive</button>

{@html supportedCountries}
