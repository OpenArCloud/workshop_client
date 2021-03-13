/*
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
*/

/* Provides models for generic content, provided by the content discovery */

import "@thirdparty/playcanvas.min.js";

/**
 * Simple sample model to place for tests.
 *
 * @returns {Entity}
 */
export function createModel() {
    const cube = new pc.Entity();
    cube.addComponent("model", {type: "box"});
    cube.setLocalScale(0.1, 0.1, 0.1);
    cube.setLocalPosition(-0.25, 0.0, 0.0);
    return cube;
}


/**
 * Creates a model for content type 'placeholder', based on optionally provided keywords.
 *
 * Positioning of the model needs to be done by the caller.
 *
 * @param keywords      string, provided by a call to a Spatial Content Discovery server
 * @returns {Entity}
 */
export function createPlaceholder(keywords) {
    const placeholder = new pc.Entity();
    placeholder.addComponent('model', {type: 'sphere'});
    placeholder.setLocalScale(2, 2, 2);
    return placeholder;
}