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

var rgb_comp = ['r', 'g', 'b', 'a'];

var xyz_comp = ['x', 'y', 'z'];

var xyzw_comp = ['x', 'y', 'z', 'w'];

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
          (error = this.parseDispatcher(nodeNames[key], nodes[key])) != null)
        return error;
    }
  }

  parseDispatcher(nodeName, node) {
    switch (nodeName) {
      case 'scene':
        return this.parseScene(node);
      case 'views':
        return this.parseViews(node);
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

  getSpaceComponents(components, phase, values, index, children) {
    for (var i = 0; i < components.length; i++) {
      var temp = this.reader.getFloat(children[index], components[i]);

      if (!(temp != null && !isNaN(temp)))
        return 'unable to parse ' + xyz_comp[i] + ' component of the ' + phase;
      else
        values.push(temp);
    }
  }

  getRGBComponents(phase, values, index, children) {
    for (var i = 0; i < 4; i++) {
      var temp = this.reader.getFloat(children[index], rgb_comp[i]);

      if (!(temp != null && !isNaN(temp)) ||
          ((i == 3 && temp >= 0 && temp <= 1)))
        return 'unable to parse ' + rgb_comp[i] + ' component of the ' + phase;
      else
        values.push(temp);
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
      this.getRGBComponents('ambient', ambientValues, ambientIndex, children);
    } else
      return 'ambient components not defined';

    var backgroundValues = [];
    if (backgroundIndex != -1) {
      this.getRGBComponents(
          'background', backgroundValues, backgroundIndex, children);
    } else
      return 'undefined backgrounds components';

    this.ambient = [];
    this.ambient['ambient'] = ambientValues;
    this.ambient['background'] = backgroundValues;
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

      var texturePath = this.reader.getString(children[i], 'file');
      if (texturePath == null) return 'no path defined for texture';

      this.textures[textureId] = [];
      this.textures[textureId]['path'] = texturePath;
    }

    this.log('parsed textures');

    return null;
  }

  /**
   * Parses the <ILLUMINATION> block.
   * @param {illumination block element} illuminationNode
   */
  parseIllumination(illuminationNode) {
    // TODO: Parse Illumination node

    this.log('Parsed illumination');

    return null;
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

      this.getSpaceComponents(
          xyz_comp, 'perspective', from_values, fromIndex, grandChildren);
      this.getSpaceComponents(
          xyz_comp, 'perspective', to_values, toIndex, grandChildren);

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

    this.log('Parsed perspectives');

    return null;
    for (var i = 0; i < 3; i++) {
      var temp;
      temp = this.reader.getFloat(grandChildren[toIndex], coords[i]);

      if (!(temp != null && !isNaN(temp)))
        return 'unable to parse ' + coords[i] +
            '-coordinate of the perspective for ID = ' + perspectiveId;
      else
        to_values[i] = temp;
    }
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


      // Get shininess status
      var shininess = this.reader.getFloat(children[i], 'shininess');
      if (shininess == null) {
        this.onXMLMinorError(
            'shininess wasn\'t correctly specified, assuming shininess 0');
        shininess = 0;
      }

      grandChildren = children[i].children;
      // Specifications for the current material.
      nodeNames = [];
      for (var j = 0; j < grandChildren.length; j++) {
        nodeNames.push(grandChildren[j].nodeName);
      }

      // Gets indices of each element.
      var emissionIndex = nodeNames.indexOf('emission');
      var ambientIndex = nodeNames.indexOf('ambient');
      var diffuseIndex = nodeNames.indexOf('diffuse');
      var specularIndex = nodeNames.indexOf('specular');


      // Retrives the material emission
      var emissions = [];
      if (emissionIndex != -1) {
        this.getSpaceComponents(
            rgb_comp, 'material ID= ' + materialID, emissions, locationIndex,
            grandChildren);
      } else
        return 'emission component undefined for ID = ' + materialID;

      // Retrieves the ambient component.
      var ambientComponent = [];
      if (ambientIndex != -1) {
        this.getRGBComponents(
            'material ID= ' + materialID, ambientComponent, ambientIndex,
            grandChildren);
      } else
        return 'ambient component undefined for ID = ' + materialID;

      // Retrieve the diffuse component
      var diffuseComponent = [];
      if (diffuseIndex != -1) {
        this.getRGBComponents(
            'material ID= ' + materialID, diffuseComponent, diffuseIndex,
            grandChildren);
      } else
        return 'diffuse component undefined for ID = ' + materialID;

      // Retrieve the specular component
      var specularComponent = [];
      if (diffuseIndex != -1) {
        this.getRGBComponents(
            'material ID= ' + materialID, specularComponent, specularIndex,
            grandChildren);
      } else
        return 'specular component undefined for ID = ' + materialID;

      this.materials[materialID] = [];
      this.materials[materialID]['shininess'] = shininess;
      this.materials[materialID]['emission'] = emissions;
      this.materials[materialID]['ambient'] = ambientComponent;
      this.materials[materialID]['diffuse'] = diffuseComponent;
      this.materials[materialID]['specular'] = specularComponent;
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

    this.omnis = [];
    this.spots = [];
    this.lights = [];
    var numLights = 0;

    var grandChildren = [];
    var nodeNames = [];

    // Any number of lights.
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'omni' && children[i].nodeName != 'spot') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current
      var lightID = this.reader.getString(children[i], 'id');
      if (lightID == null) return 'no ID defined for light';


      if (this.omnis[lightID] != null || this.spots[lightID] != null) {
        return 'ID must be unique for each material (conflict: ID = ' +
            lightID + ')';
      }

      // Get enabled status
      var enabled = this.reader.getFloat(children[i], 'enabled');
      if (enabled == null) {
        this.onXMLMinorError(
            'Enabled wasn\'t correctly specified, assuming light enabled');
        enabled = 1;
      }


      grandChildren = children[i].children;
      // Specifications for the current light.
      nodeNames = [];
      for (var j = 0; j < grandChildren.length; j++) {
        nodeNames.push(grandChildren[j].nodeName);
      }

      // Gets indices of each element.
      var locationIndex = nodeNames.indexOf('location');
      var ambientIndex = nodeNames.indexOf('ambient');
      var diffuseIndex = nodeNames.indexOf('diffuse');
      var specularIndex = nodeNames.indexOf('specular');


      // Retrieves the light location.
      var locations = [];
      if (locationIndex != -1) {
        this.getSpaceComponents(
            xyzw_comp, 'light ID= ' + lightID, locations, locationIndex,
            grandChildren);
      } else
        return 'light position undefined for ID = ' + lightId;

      // Retrieves the ambient component.
      var ambientIllumination = [];
      if (ambientIndex != -1) {
        this.getRGBComponents(
            'lights', ambientIllumination, ambientIndex, grandChildren);
      } else
        return 'ambient component undefined for ID = ' + lightID;

      // Retrieve the diffuse component
      var diffuseIllumination = [];
      if (diffuseIndex != -1) {
        this.getRGBComponents(
            'lights', diffuseIllumination, diffuseIndex, grandChildren);
      } else
        return 'ambient component undefined for ID = ' + lightID;

      // Retrieve the specular component
      var specularIllumination = [];
      if (diffuseIndex != -1) {
        this.getRGBComponents(
            'lights', specularIllumination, specularIndex, grandChildren);
      } else
        return 'specular component undefined for ID = ' + lightID;


      if (children[i].nodeName == 'spot') {
        var angle = this.reader.getString(children[i], 'angle');
        var exponent = this.reader.getString(children[i], 'exponent');

        var target = [];
        var targetIndex = nodeNames.indexOf('target');

        if (targetIndex != -1) {
          this.getSpaceComponents(
              xyz_comp, 'lights ID= ' + lightID, target, targetIndex,
              grandChildren);
        } else
          return 'target component undefined for spot light ID = ' + lightID;


        this.spots[lightID] = [];
        this.spots[lightID]['enabled'] = enabled;
        this.spots[lightID]['angle'] = angle;
        this.spots[lightID]['exponent'] = exponent;
        this.spots[lightID]['location'] = location;
        this.spots[lightID]['target'] = target;
        this.spots[lightID]['ambient'] = ambientIllumination;
        this.spots[lightID]['diffuse'] = diffuseIllumination;
        this.spots[lightID]['specular'] = specularIllumination;

      } else {
        this.omnis[lightID] = [];
        this.omnis[lightID]['enabled'] = enabled;
        this.omnis[lightID]['location'] = location;
        this.omnis[lightID]['ambient'] = ambientIllumination;
        this.omnis[lightID]['diffuse'] = diffuseIllumination;
        this.omnis[lightID]['specular'] = specularIllumination;
      }

      numLights++;
    }


    this.lights = [this.omnis, this.spots];


    if (numLights == 0)
      return 'at least one light must be defined';
    else if (numLights > 8)
      this.onXMLMinorError(
          'too many lights defined; WebGL imposes a limit of 8 lights');

    this.log('Parsed lights');

    return null;
  }



  /**
   * Parses the <TEXTURES> block.
   * @param {textures block element} texturesNode
   */
  parseTextures(texturesNode) {
    // TODO: Parse block

    console.log('Parsed textures');

    return null;
  }


  /**
   * Parses the <NODES> block.
   * @param {nodes block element} nodesNode
   */
  parseNodes(nodesNode) {
    // TODO: Parse block
    this.log('Parsed nodes');
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
  }
}