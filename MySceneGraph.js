var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.

var indexes = {
  SCENE_INDEX: 0,
  VIEWS_INDEX: 1,
  AMBIENT_INDEX: 2,
  LIGHTS_INDEX: 3,
  TEXTURES_INDEX: 4,
  MATERIALS_INDEX: 5,
  TRANSFORMATIONS_INDEX: 6,
  PRIMITIVES_INDEX: 7,
  COMPONENTS_INDEX: 8
};

var tags = [
  'scene', 'views', 'ambient', 'lights', 'textures', 'materials',
  'transformations', 'primitives', 'components'
];



var ROOT_NODENAME = 'yas';

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
  /**
   * @constructor
   */
  constructor(filename, scene) {
    this.loadedOk = null;

    // Establish bidirectional references between scene and graph.
    this.scene = scene;
    scene.graph = this;

    this.nodes = [];

    this.idRoot = null; // The id of the root element.

    this.axisCoords = [];
    this.axisCoords['x'] = [1, 0, 0];
    this.axisCoords['y'] = [0, 1, 0];
    this.axisCoords['z'] = [0, 0, 1];

    // File reading
    this.reader = new CGFXMLreader();

    /*
     * Read the contents of the xml file, and refer to this class for loading
     * and error handlers. After the file is read, the reader calls onXMLReady
     * on this object. If any error occurs, the reader calls onXMLError on this
     * object, with an error message
     */

    this.reader.open('scenes/' + filename, this);

    this.texturesPile = [];
    this.materialsPile = [];
    this.lengthPile = [];
  }


  /*
   * Callback to be executed after successful reading
   */
  onXMLReady() {
    this.log('XML Loading finished.');
    var rootElement = this.reader.xmlDoc.documentElement;

    // Here should go the calls for different functions to parse the various
    // blocks
    var error = this.parseXMLFile(rootElement);

    if (error != null) {
      this.onXMLError(error);
      return;
    }

    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional
    // initialization depending on the graph can take place
    this.scene.onGraphLoaded();
  }


  validateIds() {
    if(this.idRoot==null || this.idRoot==""){
      var k = Object.keys(this.components)[0];
      this.idRoot = k;
      this.onXMLMinorError("Root node not defined assuming node " + k);
    }

    for (var key in this.components) {
      this.containsListComponent(this.components[key].componentChildren, this.components);
      this.containsListPrimitive(this.components[key].primitiveChildren, this.primitives);
      this.containsListTexture(this.components[key].texture, this.textures);
      this.containsListMaterial(this.components[key].materials, this.materials);
    }
  }

  containsListComponent(componentList, globalList) {

    for (var i = 0; i < componentList.length; i++) {
      if (globalList[componentList[i]] === undefined) {
        this.onXMLMinorError("Reference to non existent Component");
      }
    }
  }
  containsListPrimitive(componentList, globalList) {

    for (var i = 0; i < componentList.length; i++) {
      if (globalList[componentList[i]] === undefined) {
        this.onXMLMinorError("Reference to non existent Primitive");
      }
    }
  }

  containsListTexture(componentList, globalList) {
    for (var i = 0; i < componentList.length; i += 3) {
      if (componentList[i] == "inherit" || componentList[i] == "none") continue;
      if (globalList[componentList[i]] == undefined) {
        this.onXMLMinorError("Reference to non existent Texture, using default");
        componentList[i] = "leather";
      }
    }
  }

  containsListMaterial(componentList, globalList) {

    for (var i = 0; i < componentList.length; i += 3) {
      if (componentList[i] == "inherit" || componentList[i] == "none") continue;
      if (globalList[componentList[i]] == undefined) {
        this.onXMLMinorError("Reference to non existent Material, using default");
        componentList[i] = "m1";
      }
    }
  }



  /**
   * Parses the XML file, processing each block.
   * @param {XML root element} rootElement
   */
  parseXMLFile(rootElement) {
    if (rootElement.nodeName != ROOT_NODENAME)
      return `root tag ${ROOT_NODENAME} missing`;

    var nodes = rootElement.children;

    // Reads the names of the nodes to an auxiliary buffer.
    var nodeNames = [];

    for (var i = 0; i < nodes.length; i++) {
      nodeNames.push(nodes[i].nodeName);
    }

    var error;

    // Processes each node, verifying errors.

    for (var key in Object.keys(indexes)) {
      if (nodeNames[key] != tags[key])
        return 'tag <' + tags[key] + '> missing';
      else if (
        (error = this.parseDispatcher(nodeNames[key], nodes[key])) != null) {
        onXMLError(error);
        return error;
      }
    }

    this.validateIds();
  }

  parseDispatcher(nodeName, node) {
    switch (nodeName) {
      case 'scene':
        return this.parseScene(node);
      case 'views':
        return this.parseViews(node);
      case 'ambient':
        return this.parseAmbient(node);
      case 'lights':
        return this.parseLights(node);
      case 'textures':
        return this.parseTextures(node);
      case 'materials':
        return this.parseMaterials(node);
      case 'transformations':
        return this.parseTransformations(node);
      case 'primitives':
        return this.parsePrimitives(node);
      case 'components':
        return this.parseComponents(node);
      default:
        return null;
    }
  }

  parseScene(sceneNode) {
    this.idRoot = this.reader.getString(sceneNode, 'root');

    if (this.idRoot == null || this.idRoot=="")
      this.onXMLMinorError('root node missing; assuming initial node');

    this.axis_length = this.reader.getFloat(sceneNode, 'axis_length');

    if (this.axis_length == null || this.axis_length < 0 || isNaN(this.axis_length)) {
      this.onXMLMinorError(
        'axis_length not specified or invalid; assuming \'axis_length = 5\'');
      this.axis_length = 5;
    }

    this.log('parsed scene');

    return null;
  }



  /**
   * Parses the <AMBIENT> block.
   * @param {ambient block element} ambientNode
   */
  parseAmbient(ambientNode) {
    var children = ambientNode.children;

    var nodeNames = [];

    for (var i = 0; i < children.length; i++) {
      nodeNames.push(children[i].nodeName);
    }

    // Gets indices of each element.
    var ambientIndex = nodeNames.indexOf('ambient');
    var backgroundIndex = nodeNames.indexOf('background');

    var ambientValues = [];
    getValuesOrDefault(
      this.reader, rgb_comp, 'ambient of ambient block', ambientValues,
      children[ambientIndex], rgb_default);


    var backgroundValues = [];
    getValuesOrDefault(
      this.reader, rgb_comp, 'background of ambient block', backgroundValues,
      children[backgroundIndex], [0.53, 0.81, 0.92, 1]);

    this.ambient = [];
    this.ambient['ambient'] = ambientValues;
    this.ambient['background'] = backgroundValues;

    this.log('parsed ambient');

    return null;
  }

  /**
   * Parses the <TEXTURES> block.
   * @param {textures block element} texturesNode
   */
  parseTextures(texturesNode) {
    this.textures = [];
    var children = texturesNode.children;

    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'texture') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      var textureId =
        getID(this.reader, children[i], this.textures, ' texture ');

      this.textures[textureId] =
        createTexture(this.scene, children[i], this.reader, textureId);
    }

    this.log('parsed textures');

    return null;
  }

  /**
   * Parses the <TRANSFORMATIONS> block
   * @param {transformations block element} transformationsNode
   */
  parseTransformations(transformationsNode) {
    this.transformations = [];
    var children = transformationsNode.children;
    var grandChildren = [];

    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'transformation') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      var transformationID = getID(
        this.reader, children[i], this.transformations, ' transformation ');

      grandChildren = children[i].children;

      var curr_transformation = new Transformation(this.scene);

      for (var j = 0; j < grandChildren.length; j++) {
        parseTransformation(
          this.reader, grandChildren[j], curr_transformation,
          transformationID);
      }

      this.transformations[transformationID] = curr_transformation;
    }

    this.log('parsed transformations');

    return null;
  }

  parseViews(viewsNode) {
    this.defaultPerspectiveId = this.reader.getString(viewsNode, 'default');
    if (this.defaultPerspectiveId == null || this.defaultPerspectiveId.length == 0) {
      this.onXMLMinorError(
        'no default perspective specified; assuming first one');
    }
    this.views = [];
    var children = viewsNode.children;
    var counter = 0;

    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'perspective' &&
        children[i].nodeName != 'ortho') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      if (children[i].nodeName == 'perspective')
        parsePerspective(this, this.reader, children[i])
      else parseOrtho(this, this.reader, children[i]);

      counter++;
    }

    if (counter == 0) {
      return 'at least one perspective must be defined';
    }

    if (this.views[this.defaultPerspectiveId] == undefined) {

      var key = Object.keys(this.views)[0];

      this.onXMLMinorError("Default view specified, " + this.defaultPerspectiveId + ", does not match any of the specified. Assuming " + key + ".");
      
      this.defaultPerspectiveId = key;
    }

    this.log('parsed perspectives');

    return null;
  }

  /**
   * Parses the <MATERIALS> node.
   * @param {materials block element} materialsNode
   */
  parseMaterials(materialsNode) {
    var children = materialsNode.children;
    this.materials = [];

    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'material') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current
      var materialID =
        getID(this.reader, children[i], this.materials, ' material ');

      this.materials[materialID] =
        createMaterial(this.scene, children[i], this.reader, materialID);
    }

    this.log('parsed materials');

    return null;
  }



  /**
   * Parses the <LIGHTS> node.
   * @param {lights block element} lightsNode
   */
  parseLights(lightsNode) {
    var children = lightsNode.children;

    var numLights = 0;

    this.lights = [];


    // Any number of lights.
    for (var i = 0; i < children.length; i++) {
      if (i >= 8) {
        this.onXMLMinorError(
          'too many lights defined; WebGL imposes a limit of 8 lights');
        break;
      }

      if (children[i].nodeName == 'omni' || children[i].nodeName == 'spot')
        createLight(this, children[i], this.reader);

      numLights++;
    }

    if (numLights == 0) return 'at least one light must be defined';

    this.log('parsed lights');

    return null;
  }

  /**
   * Parses the <primitives> node.
   * @param {primitives block element} primitivesNode
   */
  parsePrimitives(primitivesNode) {
    var children = primitivesNode.children;
    this.primitives = [];

    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'primitive') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      var primitiveId =
        getID(this.reader, children[i], this.primitives, ' primitive ');

      grandChildren = children[i].children;
      var curr_primitive = parsePrimitive(
        this.scene, this.reader, children[i].children[0], primitiveId);

      if (curr_primitive != null) this.primitives[primitiveId] = curr_primitive;
    }

    this.log('parsed primitives');

    return null;
  }

  /**
   * Parses the <COMPONENTS> node.
   * @param {components block element} componentsNode
   */
  parseComponents(componentsNode) {
    var children = componentsNode.children;
    this.components = [];

    for (var i = 0; i < children.length; i++) {
      var component = new Component(this.scene);
      if (children[i].nodeName != 'component') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      var componentId =
        getID(this.reader, children[i], this.components, ' component ');

      for (var j = 0; j < children[i].children.length; j++) {
        dispatchComponent(
          this, this.reader, children[i].children[j], componentId, component);
      }
      this.components[componentId] = component;
    }

    this.log('parsed components');

    return null;
  }

  /*
   * Callback to be executed on any read error, showing an error on the
   * console.
   * @param {string} message
   */
  onXMLError(message) {
    console.error('XML Loading Error: ' + message);
    this.loadedOk = false;
  }

  /**
   * Callback to be executed on any minor error, showing a warning on the
   * console.
   * @param {string} message
   */
  onXMLMinorError(message) {
    console.warn('Warning: ' + message);
  }


  /**
   * Callback to be executed on any message.
   * @param {string} message
   */
  log(message) {
    console.log('   ' + message);
  }

  /**
   * Displays the scene, processing each node, starting in the root node.
   */
  displayScene() {
    // entry point for graph rendering
    // TODO: Render loop starting at root of graph

    var rootElement = this.components[this.idRoot];
    this.materials[rootElement.materials[0]].apply();
    this.iterateChildren(rootElement);
  }

  iterateChildren(component) {


    this.scene.pushMatrix();

    this.scene.multMatrix(component.transformation.getMatrix());

    let last_tex = this.texturesPile.length - 1;
    let last_mat = this.materialsPile.length - 1;
    let last_length = this.lengthPile.length - 1;


    // Insert into pile
    if (component.texture[0] == 'inherit') {

      if (this.texturesPile.length > 0)
        this.texturesPile.push(this.texturesPile[last_tex]);

      if (component.texture[1] === undefined && component.texture[2] === undefined && this.lengthPile.length > 0)
        this.lengthPile.push(this.lengthPile[last_length - 1], this.lengthPile[last_length]);
      else
        this.lengthPile.push(component.texture[1], component.texture[2]);
    } else if (component.texture[0] != 'inherit') {
      this.texturesPile.push(component.texture[0]);

      if (component.texture[0] != 'none')
        this.lengthPile.push(component.texture[1], component.texture[2]);
    }

    if (component.materials[component.materialPos] == 'inherit' && this.materialsPile.length > 0)
      this.materialsPile.push(this.materialsPile[last_mat]);
    else if (component.materials[component.materialPos] != 'inherit')
      this.materialsPile.push(component.materials[component.materialPos]);

    this.applyAddOns();


    for (var i = 0; i < component.componentChildren.length; i++) {
      this.iterateChildren(this.components[component.componentChildren[i]]);
    }

    let l_pile = this.lengthPile.length - 1;

    for (var i = 0; i < component.primitiveChildren.length; i++) {
      var prim_name = component.primitiveChildren[i];

      if (component.texture[0] != 'none') {
        this.primitives[prim_name].updateTexCoords(this.lengthPile[l_pile - 1], this.lengthPile[l_pile]);
      }
      this.primitives[prim_name].display();
    }


    if (component.texture[0] != 'none') {
      this.lengthPile.pop();
      this.lengthPile.pop();
    }
    // Remove from pile
    this.texturesPile.pop();

    this.materialsPile.pop();

    this.scene.popMatrix();
  }

  applyAddOns() {
    let last_tex = this.texturesPile.length - 1;
    let last_mat = this.materialsPile.length - 1;


    if (this.texturesPile.length > 0 && this.texturesPile[last_tex] != 'none') {
      this.materials[this.materialsPile[last_mat]].setTexture(
        this.textures[this.texturesPile[last_tex]]);
      this.materials[this.materialsPile[last_mat]].apply();
    } else {
      this.materials[this.materialsPile[last_mat]].setTexture(null);
      this.materials[this.materialsPile[last_mat]].apply();
    }
  }

  updateMaterials() {
    for (var key in this.components) {
      this.components[key].materialPos = ++this.components[key].materialPos % this.components[key].materials.length;
    }
  }
}