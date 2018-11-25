/**
 * MyInterface class, creating a GUI interface.
 */
class MyInterface extends CGFinterface {
  /**
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * Initializes the interface.
   * @param {CGFapplication} application
   */
  init(application) {
    this.dummyVar = true;


    super.init(application);
    // init GUI. For more information on the methods, check:
    //  http://workshop.chromeexperiments.com/examples/gui

    this.gui = new dat.GUI();

    // add a group of controls (and open/expand by defult)

    this.initKeys();

    return true;
  }

  /**
   * Adds a folder containing the IDs of the lights passed as parameter.
   */
  addLightsGroup() {
    var group = this.gui.addFolder('Lights');
    group.open();
    for (let i = 0; i < this.scene.lights.length; ++i) {
      var check = group.add(this, 'dummyVar')
                      .onChange((val) => {
                        if (val)
                          this.scene.lights[i].enable();
                        else
                          this.scene.lights[i].disable();
                      })
                      .name(this.scene.lightsID[i])
                      .setValue(this.scene.isLightEnable(this.scene.lightsID[i]));
    }


    group.close();
  }

  addScaleSlider(){

    this.waterFactor = 1;

    this.gui.add(this, 'waterFactor', 0, 7).onChange((val) =>
      {
        this.scene.graph.primitives['water'].updateGuiFactor(val);

      });


  }

  addCameraGroup() {
    var keys = Object.keys(this.scene.cameras);

    this.Camera = [];

    this.Camera = this.scene.graph.defaultPerspectiveId;


    this.gui.add(this, 'Camera', keys)
        .onChange((val) => {this.scene.updateCamera(val)});
  }

  initKeys() {
		this.processKeyboard=function(){};
		this.activeKeys={};
  };

  processKeyDown(event) {
		this.activeKeys[event.code]=true;
	};

	processKeyUp(event) {

    switch(event.keyCode){
      case(77):
        this.scene.graph.updateMaterials();
    }


		this.activeKeys[event.code]=false;
	};

  
  isKeyPressed(keyCode) {
		return this.activeKeys[keyCode] || false;
	};
}
