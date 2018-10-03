var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
  /**
   * @constructor
   * @param {MyInterface} myinterface
   */
  constructor(myinterface) {
    super();

    this.interface = myinterface;
    this.lightsID = [];
  }

  /**
   * Initializes the scene, setting some WebGL defaults, initializing the camera
   * and the axis.
   * @param {CGFApplication} application
   */
  init(application) {
    super.init(application);

    this.sceneInited = false;

    this.initCameras();

    this.enableTextures(true);

    
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);

    this.lights = [];
  }

  /**
   * Initializes the scene cameras.
   */
  initCameras() {
    this.camera = new CGFcamera(
        0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
  }

  /* Handler called when the graph is finally loaded.
   * As loading is asynchronous, this may be called already after the
   * application has started the run loop
   */
  onGraphLoaded() {
    this.camera.near = this.graph.near;
    this.camera.far = this.graph.far;

    this.axis = new CGFaxis(this, this.graph.axis_length);

    // TODO: Change ambient and background details according to parsed graph
    this.gl.clearColor(this.graph.ambient.background[0], this.graph.ambient.background[1], this.graph.ambient.background[2], this.graph.ambient.background[3]);

    this.setGlobalAmbientLight(this.graph.ambient.ambient[0], this.graph.ambient.ambient[1], this.graph.ambient.ambient[2], this.graph.ambient.ambient[3]);


    // Adds lights group.
    this.interface.addLightsGroup();

    this.sceneInited = true;
  }

  updateLights() {
    for (var i = 0; i < this.lights.length; i++) {
      this.lights[i].update();
    }
  }

  /**
   * Displays the scene.
   */
  display() {
    // ---- BEGIN Background, camera and axis setup

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to
    // the origin
    this.applyViewMatrix();

    this.pushMatrix();

    if (this.sceneInited) {
      // Draw axis
      this.axis.display();

      this.updateLights();

      // Displays the scene (MySceneGraph function).
      this.graph.displayScene();
    } else {
      // Draw axis
      this.axis.display();
    }

    this.popMatrix();
    // ---- END Background, camera and axis setup
  }
}