/*
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
*/

/*
    Localizable (to different languages) storage for default content.
    Simple exports for now, will improve over time.
*/


import { readable } from 'svelte/store';


// Greets first time users with som background info about the app and its usage
export const intro = readable('', (set) => {
    set(`
    <h1>Welcome</h1>
    <div>Message, shown only the first time the app is started.</div>
    `);

    return () => set('');
});

// User returns from experience
export const outro = readable('', (set) => {
    set(`
        <h1>Howdy</h1>
        <div>How has it been? Feel free to start again</div>
    `);

    return () => set('');
});

// Repeat user. General greeting with thanks for coming back
export const info = readable('', (set) => {
    set(`<h1>Welcome back</h1>`);
    return () => set('');
});

// The device the app is running on is able to start an AR session
export const arOkMessage = readable('', (set) => {
    set(`<h2>AR is available</h2>`);
    return () => set('');
});

// The device the app is running on is unable to start an AR session with the given requirements
export const noArMessage = readable('', (set) => {
    set(`<h2>Sorry Dave, I can't do that.</h2>`);
    return () => set('');
});

// OK-button label of the overlay / dialog
export const startedOkLabel = readable('', (set) => {
    set(`Let's get started`);
    return () => set('');
});

export const doitOkLabel = readable('', (set) => {
    set(`Let's do it`);
    return () => set('');
});

