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

    this.currentFileName = null;


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


  addGameStatus(){
    var group = this.gui.addFolder('Game Settings');

    group.open();
    
    this.modes = ["Player vs Player","Player vs Bot","Bot vs Player","Bot vs Bot"]
    this.mode = "Player vs Player";
    group.add(this, 'mode', this.modes).onChange((val)=>{
      this.scene.graph.game.changeMode(val);
    });;

    this.botDifficulties = ["Random","Greedy"]
    this.FirstBot = "Random";
    group.add(this, 'FirstBot', this.botDifficulties).onChange((val)=>{
      this.scene.graph.game.changeBot1Dif(val);
    });
    this.SecondBot_BvB = "Greedy";
    group.add(this, 'SecondBot_BvB', this.botDifficulties).onChange((val)=>{
      this.scene.graph.game.changeBot2Dif(val);
    });;

    this.scenarios = ["office", "room"];
    this.scenario =  this.currentFileName.split(".")[0];

    group.add(this, 'scenario', this.scenarios).onChange( (val) =>{
      this.gui.destroy();
      this.gui = new dat.GUI();
      this.currentFileName = val + '.xml';
      this.scene.graph.changeScene(val);
    });


    group.close();

    this.NewGame = function(){
      this.scene.graph.game.resetGame();
    }

    this.undo = function(){
      this.scene.graph.game.undo();
    }

    this.BotSpeed=5;


    this.gui.add(this, 'NewGame');
    this.gui.add(this, 'BotSpeed', 0, 10).onChange((val)=>{
      this.scene.graph.game.botMult = val;
    })
    this.gui.add(this,'undo');
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
