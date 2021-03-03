<!--
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
-->

<!--
    Store for application state
-->

<script>
    import { readable } from 'svelte/store';


    export const arIsAvailable = readable(false, (set) => {
        if (navigator.xr !== undefined) {
            navigator.xr.isSessionSupported("immersive-ar")
                .then((result) => set(result));
        }

        return () => set(false);
    });
</script>
