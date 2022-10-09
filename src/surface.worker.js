import { surfaceNets } from 'isosurface'
//const { surfaceNets} = require('isosurface')
import { cellPositionMeshToVerticesArray, verticesToPositionNormal } from './geometry.js'

onmessage = function (e) {
    console.log('Message reçu depuis le script principal.');
    var mesh = surfaceNets([64, 64, 64], function (x, y, z) {
        return x * x + y * y + z * z - 100
    }, [[-11, -11, -11], [11, 11, 11]])
    const vertices = cellPositionMeshToVerticesArray(mesh)
    const positionNormal = verticesToPositionNormal(vertices)

    console.log('Envoi du message de retour au script principal');
    postMessage(positionNormal);
}
