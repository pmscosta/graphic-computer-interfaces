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

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.lights = [];
    this.cameras = [];

    this.axis = new CGFaxis(this);
  }

  /**
   * Initializes the scene cameras.
   */
  initCameras() {
    this.camera = new CGFcamera(
        0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
  }

  /**
   * Gets all the views from the parser and creates the appropriate cameras.
   */
  getViews() {
    for (var key in this.graph.views) {
      if (this.graph.views[key].type == 'perspective') {
        var new_camera = new CGFcamera(
            this.graph.views[key].angle *DEGREE_TO_RAD, this.graph.views[key].near,
            this.graph.views[key].far, this.graph.views[key].from_values,
            this.graph.views[key].to_values);
        this.cameras[key] = new_camera;
      } else {
        var new_camera = new CGFcameraOrtho(
            this.graph.views[key].left, this.graph.views[key].right,
            this.graph.views[key].bottom, this.graph.views[key].top,
            this.graph.views[key].near, this.graph.views[key].far,
            this.graph.views[key].position, this.graph.views[key].target,
            vec3.fromValues(0, 1, 0));
        this.cameras[key] = new_camera;
      }
    }

    this.camera = this.cameras[this.graph.defaultPerspectiveId];
    this.interface.setActiveCamera(this.camera);
  }

  updateCamera(key) {
    this.camera = this.cameras[key];
    this.interface.setActiveCamera(this.camera);

    console.log(this.camera);
  }

  /* Handler called when the graph is finally loaded.
   * As loading is asynchronous, this may be called already after the
   * application has started the run loop
   */
  onGraphLoaded() {
    this.axis = new CGFaxis(this, this.graph.axis_length);

    this.setGlobalAmbientLight(
        this.graph.ambient.ambient[0], this.graph.ambient.ambient[1],
        this.graph.ambient.ambient[2], this.graph.ambient.ambient[3]);

    this.gl.clearColor(
        this.graph.ambient.background[0], this.graph.ambient.background[1],
        this.graph.ambient.background[2], this.graph.ambient.background[3]);

    this.getViews();

    this.interface.addCameraGroup();

    this.initLights();

    // Adds lights group.
    this.interface.addLightsGroup();

    this.updateLights();

    this.sceneInited = true;
  }

  initLights() {
    var i = 0;

    for (var key in this.graph.lights) {
      if (i >= 8) break;

      this.lightsID.push(key);

      this.lights[i] = new CGFlight(this, i);

      var location = this.graph.lights[key].location;
      var ambientIllumination = this.graph.lights[key].ambient;
      var diffuseIllumination = this.graph.lights[key].diffuse;
      var specularIllumination = this.graph.lights[key].specular;

      this.lights[i].setPosition(
          location[0], location[1], location[2], location[3]);
      this.lights[i].setAmbient(
          ambientIllumination[0], ambientIllumination[1],
          ambientIllumination[2], ambientIllumination[3]);
      this.lights[i].setDiffuse(
          diffuseIllumination[0], diffuseIllumination[1],
          diffuseIllumination[2], diffuseIllumination[3]);
      this.lights[i].setSpecular(
          specularIllumination[0], specularIllumination[1],
          specularIllumination[2], specularIllumination[3]);


      if (this.graph.lights[key].type == 'spot') {
        var target = this.graph.lights[key].target;
        var exponent = this.graph.lights[key].exponent;
        var angle = this.graph.lights[key].angle;

        this.lights[i].setSpotCutOff(angle);
        this.lights[i].setSpotExponent(exponent);
        this.lights[i].setSpotDirection(target[0], target[1], target[2]);
      }

      this.lights[i].setVisible(true);

      if (this.graph.lights[key].enabled)
        this.lights[i].enable();
      else
        this.lights[i].disable();


      this.lights[i].update();

      i++;
    }
  }


  isLightEnable(key) {

    return this.graph.lights[key].enabled;

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
      this.updateMaterials();

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

  updateMaterials(){
    if(this.interface.isKeyPressed("KeyM") || this.interface.isKeyPressed("Keym"))
    {
      this.graph.updateMaterials();
    }
  }
}