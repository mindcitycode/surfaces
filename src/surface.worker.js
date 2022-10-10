import { surfaceNets, marchingCubes } from 'isosurface'
import { cellPositionMeshToVerticesArray, verticesToPositionNormal } from './geometry.js'
import { Vector3 } from 'three'
import { Sphere, Subtraction, Union, Intersection, Box, CachedShape, Transform } from './sdf.js'

const clog = txt => console.log("%c[surface-worker]%c " + txt, "color:orange;background-color:black;", "color:black")

onmessage = function (e) {
    const startedAt = performance.now()
    clog("computing surface net and normals....")

    const sphere0 = new Sphere(3, 0, 0, 5)
    const sphere1 = new Sphere(-3, 0, 0, 5)
    const spheres = new Subtraction(sphere0, sphere1)
    const box = new Box(1, 2, 4)

    const shape0 = new Intersection(
        new Union(
            new Box(1, 1, 2),
            new Subtraction(
                new Box(20, 2, 2),
                new Union(
                    new Subtraction(
                        box,
                        spheres,
                    ),
                    new Subtraction(
                        new Box(3, 10, 3),
                        new Sphere(5, 0, 0, 5)
                    )
                )
            )
        )
    )

    const shape = new Box(2, 2, 2)

    const transforms = new Transform()
    transforms.position.x = 4
    transforms.scale.set(1, 1, 1)
    transforms.rotation.x = Math.PI / 4
    transforms.rotation.y = Math.PI / 4
    transforms.update()

    const dims = [64, 64, 64]
    const bounds = [[-11, -11, -11], [11, 11, 11]]

    const p = new Vector3()
    var mesh = surfaceNets(dims, (x, y, z) => {
        p.set(x, y, z)
        const pp = transforms.apply(p.set(x, y, z))
        return shape.sdf(pp)
    }, bounds)

    const vertices = cellPositionMeshToVerticesArray(mesh)
    const positionNormal = verticesToPositionNormal(vertices)

    clog(`done, took ${this.performance.now() - startedAt}ms`)

    postMessage(positionNormal);

}
