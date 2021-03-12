/*
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
*/

/*
    Utility function helping with calculations around GeoPose.
 */

/**
 *  Calculates the local position of a provided GeoPose in relation to the provided local reference pose.
 *
 * @param localisationPose  XRPose      Local pose provided by the XRSession for the latest localisation
 * @param objectPose  GeoPose       Global position as provided by a request to a Spatial Content Discovery server
 * @returns {number[]}      Local location of the global GeoPose relative to the provided local pose
 */
export function calculateLocalLocation(localisationPose, objectPose) {
    return [0, 0, 0];
}


