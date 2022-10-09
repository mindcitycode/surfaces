import { Vector3 } from 'three'

export class Sphere {
    constructor(cx, cy, cz, radius) {
        Object.assign(this, {
            center: new Vector3(cx, cy, cz),
            radius,
            squaredRadius: radius * radius
        })
    }
    sdf(p) {
        //return this.center.distanceToSquared(p) - this.squaredRadius
        return this.center.distanceTo(p) - this.radius
    }
}
//const q = new Vector3()

export class Box {
    //static #q = new Vector3()
    static q = new Vector3()
    static q1 = new Vector3()
    static v000 = new Vector3(0, 0, 0)
    /*
    
float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
*/
    constructor(x, y, z) {
        Object.assign(this, {
            b: new Vector3(x, y, z),
        })
    }
    sdf(p) {
        const q = Box.q
        Box.q.set(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)).sub(this.b)
        const t1 = Box.q1.copy(Box.q).max(Box.v000).length()
        const t2 = Math.min(Math.max(Box.q.x, Math.max(Box.q.y, Box.q.z)), 0)
        return t1 + t2
    }
}
export class Union {
    constructor(...shapes) {
        Object.assign(this, { shapes })
    }
    sdf(p) {
        return Math.min.apply(Math, this.shapes.map(shape => shape.sdf(p)));
    }
}
export class Intersection {
    constructor(...shapes) {
        Object.assign(this, { shapes })
    }
    sdf(p) {
        return Math.max.apply(Math, this.shapes.map(shape => shape.sdf(p)));
    }
}
export class Subtraction {
    constructor(shape0, shape1) {
        Object.assign(this, { shape0, shape1 })
    }
    sdf(p) {
        return Math.max(-1 * this.shape0.sdf(p), this.shape1.sdf(p))
    }
}

