/*
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
*/

/* Provider for common data types and functions */


/**
 * Type for location info, no orientation
 *
 * @type {{regionCode: string, h3Index: number}}
 */
export const LOCATIONINFO = {
    h3Index: 0,
    lat: 0,
    lon: 0,
    regionCode: ''
}

/**
 * Empty Spatial Services Record to initialize variables.
 *
 * @type {{altitude: number, provider: string, geometry: {}, id: string, services: [], type: string, timestamp: number}}
 */
export const SSR = {
    id: '',
    type: '',
    services: [],
    geometry: {},
    altitude: 0,
    provider: '',
    timestamp: 0
}

export const SCR = {
    id: '',
    type: '',
    content: {},
    tenant: '',
    timestamp: 0
}

export const GEOPOSE = {
    longitude: 0,
    latitude: 0,
    ellipsoidHeight: 0,
    quaternion: []
}

export const LOCALPOSE = {
    transform: {x: 0, y: 0, z: 0, w: 1},
    orientation: {x: 0, y: 0, z: 0, w: 0},
    matrix: {},
    inverse: {}
}

/**
 * Empty service value, contained in the services array of an SSR.
 *
 * @type {{capabilities: [], description: string, id: string, type: string, title: string, url: string}}
 */
export const SERVICE = {
    id: '',
    type: '',
    title: '',
    description: '',
    url: '',
    capabilities: []
}

/**
 * Implemented AR modes of the client.
 *
 * auto: The client selects one of the modes, depending the availability of AR functionality and discovery services
 * oscp: Use discovery services for localisation and content discovery
 * marker: Use marker to define a reference point for content
 *
 * @type {{auto: string, oscp: string, marker: string}}
 */
export const ARMODES = {
    auto: 'Auto',
    marker: 'Marker',
    oscp: 'ARCloud'
}

/**
 * Converting a WebGLTexture to base64 encoded image.
 *
 * Copy paste from https://stackoverflow.com/questions/8191083/can-one-easily-create-an-html-image-element-from-a-webgl-texture-object
 * Pretty sure this can be optimized for this specific use.
 *
 * @param gl    Context of the canvas to use
 * @param texture       The texture to convert
 * @param width     Width of the resulting image
 * @param height        Height of the resulting image
 * @returns {string}        base64 encoded string of the image (will likely change)
 */
export function createImageFromTexture(gl, texture, width, height) {
    // Create a framebuffer backed by the texture
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    // Read the contents of the framebuffer
    const data = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.deleteFramebuffer(framebuffer);

    // Create a 2D canvas to store the result
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    // Copy the pixels to a 2D canvas
    const imageData = context.createImageData(width, height);
    imageData.data.set(data);

    // Image is vertically flipped
    // Didn't find a better way to flip the image back
    const imageFlip = new ImageData (canvas.width, canvas.height) ;
    const Npel      = imageData.data.length / 4 ;

    for ( let kPel = 0 ; kPel < Npel ; kPel++ ) {
        const kFlip      = flip_index (kPel, canvas.width, canvas.height) ;
        const offset     = 4 * kPel ;
        const offsetFlip = 4 * kFlip ;
        imageFlip.data[offsetFlip] = imageData.data[offset] ;
        imageFlip.data[offsetFlip + 1] = imageData.data[offset + 1] ;
        imageFlip.data[offsetFlip + 2] = imageData.data[offset + 2] ;
        imageFlip.data[offsetFlip + 3] = imageData.data[offset + 3] ;
    }

    context.putImageData(imageFlip, 0, 0);
    return canvas.toDataURL('image/jpeg');
}

function flip_index (kPel, width, height) {
    var i     = Math.floor (kPel / width) ;
    var j     = kPel % width ;

    return height * width - (i + 1) * width + j ;
}

/**
 * Utility function used to delay the execution of the next expression delay milliseconds.
 *
 * @param delay
 * @returns {Promise<null>}
 */
export function wait(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Delays the execution of the provided function until timeout expired.
 *
 * @param func  function        Will be executed when timeout expires
 * @param timeout  Number       Duration in milliseconds to delay the execution of the provided function
 * @returns {function(...[*]=): void}
 */
export function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}