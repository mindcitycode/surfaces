import { surfaceNets } from 'isosurface'
import { cellPositionMeshToVerticesArray, verticesToPositionNormal } from './geometry.js'
const clog = txt => console.log("%c[surface-worker]%c " + txt, "color:orange;background-color:black;", "color:black")
import { Vector3 } from 'three'
import { Sphere, Subtraction, Union, Intersection, Box} from './sdf.js'

onmessage = function (e) {
    const startedAt = performance.now()
    clog("computing surface net and normals....")

    const sphere0 = new Sphere(3, 0, 0, 5)
    const sphere1 = new Sphere(-3, 0, 0, 5)
    //const spheres = new Union(sphere0,sphere1)
    //   const spheres = new Intersection(sphere0, sphere1)
    const spheres = new Subtraction(sphere0, sphere1)
    const box = new Box(1,2,4)

    const shape = new Subtraction(
        box,
        spheres,
        
    )

    const p = new Vector3()
    var mesh = surfaceNets([64, 64, 64], function (x, y, z) {
        p.set(x, y, z)
        return shape.sdf(p)
    }, [[-11, -11, -11], [11, 11, 11]])

    const vertices = cellPositionMeshToVerticesArray(mesh)
    const positionNormal = verticesToPositionNormal(vertices)

    clog(`done, took ${this.performance.now() - startedAt}ms`)

    postMessage(positionNormal);

}
/*
        const coords = { x: {}, y: {}, z: {} }
        coords.x[x] = 1 + (coords.x[x] || 0)
        coords.y[y] = 1 + (coords.y[y] || 0)
        coords.z[z] = 1 + (coords.z[z] || 0)
    console.log(coords)

    */