/*
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
*/

/*
    Store for application state
*/


import { readable, writable, derived } from 'svelte/store';

import { LOCATIONINFO, SERVICE, ARMODES } from "./core/common.js";


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
const storedShowDashboard = true;  // localStorage.getItem('showdashboard') !== 'false';
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


/**
 * Reads and stores the setting which AR mode should be used.
 *
 * @type {string}
 */
const storedArMode = localStorage.getItem('storedarmode');
export const arMode = writable(storedArMode || ARMODES.auto);
arMode.subscribe(value => {
    localStorage.setItem('storedarmode', value);
})


/**
 * The rough location of the device when the application was started.
 *
 * @type {Writable<LOCATIONINFO>}
 */
export const initialLocation = writable({
    h3Index: 0,
    lat: 0,
    lon: 0,
    regionCode: ''
});


/**
 * Currently valid ssr record, containing the last requested spatial services record.
 *
 * @type {Writable<{SSR[]}>}
 */
export const ssr = writable([]);


/**
 * Derived store of the ssr store for easy access of all contained GeoPose services.
 *
 * @type {Readable<SERVICE[]>}
 */
export const availableGeoPoseServices = derived(ssr, ($ssr, set) => {
    let geoposeServices = [];
    for (let record of $ssr) {
        // TODO: Check
        geoposeServices.concat(record.services
            .forEach(service => {
                if(service.type === 'geopose')
                    geoposeServices.push(service);
            }));
    }
    set(geoposeServices);
}, []);


/**
 * Derived store of ssr store for easy access of all contained content services.
 *
 * @type {Readable<SERVICE[]>}
 */
export const availableContentServices = derived(ssr, ($ssr, set) => {
    let contentServices = [];
    for (let record of $ssr) {
        contentServices.concat(record.services
            .forEach(service => {
                if (service.type === 'content-discovery')
                    contentServices.push(service);
            }));
    }
    set(contentServices);
}, []);


/**
 * The one of the returned GeoPose service to be used for localisation.
 *
 * @type {Writable<SERVICE>}
 */
export const selectedGeoPoseService = writable('none');


/**
 * The one of the returned content services to be used to look for content around the current location.
 *
 * @type {Writable<SERVICE>}
 */
export const selectedContentService = writable('none');


/**
 * The marker image file to use for marker mode.
 *
 * @type {Writable<string>}
 */
export const currentMarkerImage = writable('marker.jpg');


/**
 * The width of the marker image in meters.
 *
 * @type {Writable<string>}
 */
export const currentMarkerImageWidth = writable('0.2');