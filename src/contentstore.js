/*
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
*/

/*
    Localizable (to different languages) storage for default content.
    Simple exports for now, will improve over time.
*/


// Greets first time users with som background info about the app and its usage
export const intro = `
        <h1>Welcome</h1>
        <div>Message, shown only the first time the app is started.</div>
    `;

// User returns from experience
export const outro = `
        <h1>Howdy</h1>
        <div>How has it been? Feel free to start again</div>
    `;

// Repeat user. General greeting with thanks for coming back
export const info = `<h1>Welcome back</h1>`;

// The device the app is running on is able to start an AR session
export const arOkMessage = `<h2>AR is available</h2>`;

// The device the app is running on is unable to start an AR session with the given requirements
export const noArMessage = `<h2>Sorry Dave, I can't do that.</h2>`;

// Button label
export const startedOkLabel = `Let's get started`;

// Button label
export const doitOkLabel = `Let's do it`;

