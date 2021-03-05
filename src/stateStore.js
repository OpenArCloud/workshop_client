/*
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
*/

/*
    Store for application state
*/


import { readable, writable } from 'svelte/store';


/**
 * Determines the availability of AR functions on the current device.
 *
 * @type {Readable<boolean>}    true when available, false otherwise
 */
export const arIsAvailable = readable(false, (set) => {
    if (navigator.xr !== undefined) {
        navigator.xr.isSessionSupported("immersive-ar")
            .then((result) => set(result));
    }

    return () => set(false);
});


/**
 * Reads and stores the setting whether or not to display the dashboard persistently.
 *
 * @type {boolean}  true when dashboard should be shown, false otherwise
 */
const storedShowDashboard = localStorage.getItem('showdashboard') !== 'false';
export const showDashboard = writable(storedShowDashboard);
showDashboard.subscribe(value => {
    localStorage.setItem('showdashboard', value === true ? 'true' : 'false');
});


/**
 * Reads and stores the setting whether or not the user has already seen the intro.
 *
 * @type {boolean}  true when the intro was already seen, false otherwise
 */
const storedHasIntroSeen = false;  // localStorage.getItem('hasintroseen') === 'true';
export const hasIntroSeen = writable(storedHasIntroSeen);
hasIntroSeen.subscribe(value => {
    localStorage.setItem('hasintroseen', value === true ? 'true' : 'false');
})


export const initialLocation = writable(null);
