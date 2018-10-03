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

    this.idRoot = null;  // The id of the root element.

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
    this.rootNode = this.reader.getString(sceneNode, 'root');

    if (this.rootNode == null)
      this.onXMLMinorError('root node missing; assuming initial node');
    this.axis_length = this.reader.getFloat(sceneNode, 'axis_length');

    if (this.axis_length == null || this.axis_length < 0) {
      this.onXMLMinorError(
          'axis_length not specified or invalid; assuming \'axis_length = 5\'');
      this.axis_length = 5;
    }
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
    if (ambientIndex != -1) {
      getRGBComponents(
          this.reader, 'ambient', ambientValues, children[ambientIndex]);
    } else
      return 'ambient components not defined';

    var backgroundValues = [];
    if (backgroundIndex != -1) {
      getRGBComponents(
          this.reader, 'background', backgroundValues,
          children[backgroundIndex]);
    } else
      return 'undefined backgrounds components';


      console.log(ambientValues);

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

      var textureId = this.reader.getString(children[i], 'id');
      if (textureId == null) return 'no ID defined for texture';

      if (this.textures[textureId] != null) {
        return 'ID must be unique for each texture (conflict: ID = ' +
            textureId + ')';
      }

      this.textures[textureId] = createTexture(this.scene, children[i], this.reader, textureId);
      
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
    var nodeNames = [];
    var grandChildren = [];
    var counter = 0;

    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'transformation') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      var transformationID = this.reader.getString(children[i], 'id');
      if (transformationID == null) return 'no ID defined for perspective';

      if (this.transformations[transformationID] != null)
        return 'ID must be unique for each perspective (conflict: ID = ' +
            transformationID + ')';


      grandChildren = children[i].children;


      var curr_transformation = new Transformation(this.scene);

      for (var j = 0; j < grandChildren.length; j++) {
        parseTransformation(
            this.reader, grandChildren, j, curr_transformation,
            transformationID);
      }

      this.transformations[transformationID] = curr_transformation;
    }
  }

  parseViews(viewsNode) {
    this.defaultPerspectiveId = this.reader.getString(viewsNode, 'default');

    if (this.defaultPerspectiveId == null) {
      this.onXMLMinorError(
          'no default perspective specified; assuming first one');
    }

    this.perspectives = [];
    var children = viewsNode.children;
    var nodeNames = [];
    var grandChildren = [];
    var counter = 0;

    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'perspective') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      var perspectiveId = this.reader.getString(children[i], 'id');
      if (perspectiveId == null) return 'no ID defined for perspective';

      if (this.perspectives[perspectiveId] != null) {
        return 'ID must be unique for each perspective (conflict: ID = ' +
            perspectiveId + ')';
      }

      var near = this.reader.getFloat(children[i], 'near');

      if (near == null || near < 0) {
        this.onXMLMinorError(
            'near not specified or invalid; assuming \'near = 0.1\'');
        near = 5;
      }


      var far = this.reader.getFloat(children[i], 'far');

      if (far == null || far < 0) {
        this.onXMLMinorError(
            'far not specified or invalid; assuming \'far = 500\'');
        far = 500;
      }

      var angle = this.reader.getFloat(children[i], 'angle');

      if (angle == null || angle < 0) {
        this.onXMLMinorError(
            'angle not specified or invalid; assuming \'angle = 0\'');
        angle = 0;
      }

      grandChildren = children[i].children;

      // specifications for the current perspective
      nodeNames = [];
      for (var j = 0; j < grandChildren.length; j++) {
        nodeNames.push(grandChildren[j].nodeName);
      }

      var fromIndex = nodeNames.indexOf('from');
      var toIndex = nodeNames.indexOf('to');

      if (fromIndex == -1 || toIndex == -1)
        return 'from or to values undefined for perspective with id' +
            perspectiveId;

      var from_values = [];
      var to_values = [];

      getSpaceComponents(
          this.reader, xyz_comp, 'perspective', from_values,
          grandChildren[fromIndex]);
      getSpaceComponents(
          this.reader, xyz_comp, 'perspective', to_values,
          grandChildren[toIndex]);

      if (this.defaultPerspectiveId == null)
        this.defaultPerspectiveId = perspectiveId;

      this.perspectives[perspectiveId] = [];
      this.perspectives[perspectiveId]['near'] = near;
      this.perspectives[perspectiveId]['far'] = far;
      this.perspectives[perspectiveId]['angle'] = angle;
      this.perspectives[perspectiveId]['from_values'] = from_values;
      this.perspectives[perspectiveId]['to_values'] = to_values;

      counter++;
    }

    if (counter == 0) {
      return 'at least one perspective must be defined';
    }

    this.near = this.perspectives[this.defaultPerspectiveId].near;
    this.far = this.perspectives[this.defaultPerspectiveId].far;

    this.log('Parsed perspectives');

    return null;
  }

  /**
   * Parses the <MATERIALS> node.
   * @param {materials block element} materialsNode
   */
  parseMaterials(materialsNode) {
    var children = materialsNode.children;
    this.materials = [];
    var grandChildren = [];
    var nodeNames = [];

    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'material') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current
      var materialID = this.reader.getString(children[i], 'id');
      if (materialID == null) return 'no ID defined for material';

      if (this.materials[materialID] != null) {
        return 'ID must be unique for each material (conflict: ID = ' +
            materialID + ')';
      }

      this.materials[materialID] = createMaterial(this.scene, children[i], this.reader, materialID);
    }

    this.log('Parsed materials');

    return null;
  }



  /**
   * Parses the <LIGHTS> node.
   * @param {lights block element} lightsNode
   */
  parseLights(lightsNode) {
    var children = lightsNode.children;

    var numLights = 0;


    // Any number of lights.
    for (var i = 0; i < children.length; i++) {
      switch (children[i].nodeName) {
        case 'omni':
          createOmniLight(this.scene, children[i], this.reader);
          break;
        case 'spot':
          createSpotLight(this.scene, children[i], this.reader);
          break;
        default:
          this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
          continue;
      }

      numLights++;
    }

    if (numLights == 0)
      return 'at least one light must be defined';
    else if (numLights > 8)
      this.onXMLMinorError(
          'too many lights defined; WebGL imposes a limit of 8 lights');

    this.log('Parsed lights');

    return null;
  }

    /**
   * Parses the <primitives> node.
   * @param {primitives block element} primitivesNode
   */
  parsePrimitives(primitivesNode){

    var children = primitivesNode.children;
    this.primitives=[];
    var nodenames=[];
    var grandchildren=[];
    var counter=0;


    for (var i = 0; i < children.length; i++) {
        if(children[i].nodeName != 'primitive')
        {
          this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
         continue;
        }

        var primitiveId=this.reader.getString(children[i],'id');
        if(primitiveId== null) return 'No id defined for primitive';

        if(this.primitives[primitiveId] !=null)
          return 'ID must be unique for each primitive (conflict: ID = ' +
          primitiveId + ')';

        grandChildren=children[i].children;

        var specifications =["square","x1","y1","x2","y2"];

        var curr_primitive=  parsePrimitive(this.reader,grandchildren,primitiveId);

        this.primitives[primitiveId]=curr_primitive;
    }


  }

  /**
   * Parses the <COMPONENTS> node.
   * @param {components block element} componentsNode
   */
  parseComponents(componentsNode) {

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
  }
}