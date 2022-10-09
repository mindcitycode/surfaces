import * as THREE from 'three'
export const cellPositionMeshToVerticesArray = (iso) => {
    const { cells, positions } = iso
    const verticesList = []
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i] // triangle
        for (let j = 0; j < 3; j++) {
            const pidx = cell[j] // vertex index
            const vertice = positions[pidx]
            verticesList.push(...vertice)
        }
    }
    const vertices = new Float32Array(verticesList)
    return vertices
}
export const verticesToThreeGeometry = vertices => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geometry.computeVertexNormals()
    return geometry
}
export const verticesToPositionNormal = vertices => {
    const geometry = verticesToThreeGeometry(vertices)
    return {
        position : geometry.attributes.position.array,
        normal : geometry.attributes.normal.array
    }
}
export const positionNormalToThreeGeometry = ({ position, normal }) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geometry.setAttribute('normal', new THREE.BufferAttribute(normal, 3))
    return geometry
}
export const cellPositionMeshToThreeGeometry = (iso) => {
    const geometry = new THREE.BufferGeometry();
    const vertices = cellPositionMeshToVerticesArray(iso)
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geometry.computeVertexNormals()
    return geometry
}
