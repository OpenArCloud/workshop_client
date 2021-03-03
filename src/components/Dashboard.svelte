<!--
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
-->

<!--
    This component displays the internals of the app, and allows to change them when possible.
-->

<script>
    import { createEventDispatcher } from 'svelte';

    // Used to dispatch events to parent
    const dispatch = createEventDispatcher();
</script>


<div>
    <input id="showagain" type="checkbox" checked />
    <label for="showagain">Show Dashboard next time</label>
</div>

<p>GeoPose Server</p>
<p>Content Server</p>

<p>GeoPose</p>

<p>Headless available</p>

<div>
    <input id="allowP2p" type="checkbox" checked />
    <label for="allowP2p">Connect to local network</label>
    <p>Connected to p2p network</p>
</div>

<button>localize now</button>

<button on:click={() => dispatch('okClicked')}>Go immersive</button>
