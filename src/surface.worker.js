import { surfaceNets, marchingCubes } from 'isosurface'
import { cellPositionMeshToVerticesArray, verticesToPositionNormal } from './geometry.js'
import { Vector3 } from 'three'
import { Sphere, Subtraction, Union, Intersection, Box, CachedShape, Transform, Torus, InfiniteCylinder } from './sdf.js'

const clog = txt => console.log("%c[surface-worker]%c " + txt, "color:orange;background-color:black;", "color:black")

const demoShape0 = new Intersection(
    new Sphere(5),
    new CachedShape({
        sdf: () => {
            return Math.random() - 0.5
        }
    })
)

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
const demoShape1 = new Union(
    new Subtraction(
        new Union(
            new Box(10, 3, 3),
            new Box(3, 10, 3),
            new Box(3, 3, 10)
        ),
        new Subtraction(
            new Sphere(8),
            new Sphere(10),
        )
    ),
    new Sphere(4),
)
const demoshape2 = () => {
    const hollowTorus = (x, y) => new Subtraction(
        new Torus(x, y - 0.5),
        new Torus(x, y)
    )

    const shape = new Subtraction(
        new Transform(new Sphere(10)).set(({ position }) => position.set(8, 4, 8)),
        new Union(
            hollowTorus(8, 2),
            new Transform(hollowTorus(7, 2)).set(({ position }) => position.y = 2),
            new Transform(hollowTorus(6, 2)).set(({ position }) => position.y = 3),
            new Transform(hollowTorus(5, 2)).set(({ position }) => position.y = 4),
            new Transform(hollowTorus(4, 2)).set(({ position }) => position.y = 5),
        )
    )
    return shape
}
const demoshape3 = () => {
    const box = new Transform(new Box(2, 4, 1)).set(({ rotation }) => rotation.x = Math.PI / 8)
    const sphere = new Sphere(3)
    const torus = new Torus(3, 1)
    return new Union(
        new Transform(box).set(({ position }) => position.set(5, 0, 5)),
        new Transform(sphere).set(({ position }) => position.set(-5, 0, 5)),
        new Transform(torus).set(({ position }) => position.set(5, 0, -5)),
        new Transform(new Union(box, sphere, torus)).set(({ position }) => position.set(-5, 0, -5)),
        new Transform(new Subtraction(sphere, new Union(box, torus))).set(({ position }) => position.set(0, 1, 0)),

    )
}
onmessage = function (e) {
    clog("computing surface net and normals....")
    const startedAt = performance.now()

    const shape = new Union(
        new Sphere(3, 0, 5, 0),
        new Subtraction(
            new Torus(5, 3),
            new Intersection(
                new InfiniteCylinder(5),
                new Box(10, 5, 10)
            ),
        )
    )
    const density = 2 //5//8//5
    const bounds = [[-11, -11, -11], [11, 11, 11]]
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

    clog(`done, took ${this.performance.now() - startedAt}ms ,  ${(this.performance.now() - startedAt) / 1000}s`)

    postMessage(positionNormal);
}