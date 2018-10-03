/**
 * MyTorus
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTorus extends CGFobject {
  constructor(scene, inner, outer, slices, loops) {
    super(scene);
    this.scene = scene;
    this.inner = inner;
    this.outer = outer;
    this.slices = slices;
    this.loops = loops;
    this.arc = Math.PI * 2;

    this.initBuffers();
  };



  initBuffers() {

    var radius = this.inner;
    var tube = this.outer;
    var radialSegments = this.slices;
    var tubularSegments = this.loops;
    var arc = this.arc;
    	// buffers

	var indices = [];
	var vertices = [];
	var normals = [];
	var uvs = [];

	// helper variables

	var center = {x: 0, y: 0, z: 0};
	var vertex = {x: 0, y: 0, z: 0};
	var normal = {x: 0, y: 0, z: 0};

	var j, i;

	// generate vertices, normals and uvs

	for ( j = 0; j <= radialSegments; j ++ ) {

		for ( i = 0; i <= tubularSegments; i ++ ) {

			var u = i / tubularSegments * arc;
			var v = j / radialSegments * Math.PI * 2;

			// vertex

			vertex.x = ( radius + tube * Math.cos( v ) ) * Math.cos( u );
			vertex.y = ( radius + tube * Math.cos( v ) ) * Math.sin( u );
			vertex.z = tube * Math.sin( v );

			vertices.push( vertex.x, vertex.y, vertex.z );

			// normal

			center.x = radius * Math.cos( u );
			center.y = radius * Math.sin( u );
			
            normal.x = vertex.x - center.x;
            normal.y = vertex.y - center.y;
            normal.z = vertex.z - center.z;

            let comp = Math.sqrt(Math.pow(normal.x, 2) +Math.pow(normal.y, 2) +Math.pow(normal.z, 2))

            normal.x = normal.x / comp; 
            normal.y = normal.y / comp; 
            normal.z = normal.z / comp;

			normals.push( normal.x, normal.y, normal.z );

			// uv

			uvs.push( i / tubularSegments );
			uvs.push( j / radialSegments );

		}

	}

	// generate indices

	for ( j = 1; j <= radialSegments; j ++ ) {

		for ( i = 1; i <= tubularSegments; i ++ ) {

			// indices

			var a = ( tubularSegments + 1 ) * j + i - 1;
			var b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
			var c = ( tubularSegments + 1 ) * ( j - 1 ) + i;
			var d = ( tubularSegments + 1 ) * j + i;

			// faces

			indices.push( a, b, d );
			indices.push( b, c, d );

		}

    }
    
    this.texCoords = uvs;
    this.indices = indices;
    this.vertices = vertices;
    



    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  };
};
