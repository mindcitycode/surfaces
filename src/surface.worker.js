import { surfaceNets, marchingCubes } from 'isosurface'
import { cellPositionMeshToVerticesArray, verticesToPositionNormal } from './geometry.js'
import { Vector3 } from 'three'
import { Sphere, Subtraction, Union, Intersection, Box, CachedShape, Transform } from './sdf.js'

const clog = txt => console.log("%c[surface-worker]%c " + txt, "color:orange;background-color:black;", "color:black")

const demoShape = () => {
    const sphere0 = new Sphere(5, 3, 0, 0)
    const sphere1 = new Sphere(5, -3, 0, 0)
    const spheres = new Subtraction(sphere0, sphere1)
    const box = new Box(1, 2, 4)

    const shape0 =
        new Intersection(
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
                            new Sphere(5, 5, 0, 0)
                        )
                    )
                )
            )
        )

    const shape =
        new Transform(
            new Subtraction(
                new Box(4, 4, 4),
                new Transform(shape0).set(({ position, rotation }) => {
                    rotation.x = Math.PI / 5
                    rotation.y = Math.PI * 1.5
                })
            )
        ).set(({ position }) => position.y = 4)
    return shape
}

onmessage = function (e) {
    clog("computing surface net and normals....")
    const startedAt = performance.now()

    const shape = new Subtraction(new Box(5,5,5),new Sphere(6))
    const bounds = [[-11, -11, -11], [11, 11, 11]]
    const density = 8//5
    const dims = [
        (bounds[1][0] - bounds[0][0]) * density,
        (bounds[1][1] - bounds[0][1]) * density,
        (bounds[1][2] - bounds[0][2]) * density,
    ]
    const p = new Vector3()
    var mesh = surfaceNets(dims, (x, y, z) => {
        p.set(x, y, z)
        return shape.sdf(p)
    }, bounds)

    const vertices = cellPositionMeshToVerticesArray(mesh)
    const positionNormal = verticesToPositionNormal(vertices)

    clog(`done, took ${this.performance.now() - startedAt}ms`)

    postMessage(positionNormal);

}
