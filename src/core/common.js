/*
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
*/

/*  */

import { supportedCountries } from 'ssd-access';
import * as h3 from "h3-js";


/**
 * Type for location info, no orientation
 *
 * @type {{regionCode: string, h3Index: number}}
 */
export const LOCATIONINFO = {
    h3Index: 0,
    regionCode: ''
}

export const SSR = {
    id: '',
    type: '',
    services: [],
    geometry: {},
    altitude: 0,
    provider: '',
    timestamp: 0
}

export const SERVICE = {
    id: '',
    type: '',
    title: '',
    description: '',
    url: '',
    capabilities: []
}


/**
 *  Promise resolving to the current location (lat, lon) and region code (country currently) of the device.
 *
 * @returns {Promise<LOCATIONINFO>}     Object with lat, lon, regionCode or rejects
 */
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const latAngle = position.coords.latitude;
                const lonAngle = position.coords.longitude;

                fetch(`https://nominatim.openstreetmap.org/reverse?
                        lat=${latAngle}&lon=${lonAngle}&format=json&zoom=1&email=info%40michaelvogt.eu`)
                    .then((response) => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            reject(response.text());
                        }
                    })
                    .then((data) => {
                        const countryCode = data.address.country_code;
                        resolve({
                            h3Index: h3.geoToH3(latAngle, lonAngle, 8),
                            regionCode: supportedCountries.includes(countryCode) ? countryCode : 'us'
                        })
                    })
                    .catch((error) => {
                        reject(error.statusText());
                    });
            }, (error) => {
                console.log(`Location request failed: ${error}`)
                reject(error);
            }, {
                enableHighAccuracy: false,
                maximumAge: 0
            });
        } else {
            reject('Location is not available');
        }
    });
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
    context.putImageData(imageData, 0, 0);

    const img = new Image();
    img.src = canvas.toDataURL('image/jpeg');
    return img;
}
