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

var tags = ["scene", "views", "ambient", "lights", "textures", "materials", "transformations", "primitives", "components"];

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
      else if ((error = this.parseDispatcher(nodeNames[key], nodes[key])) != null)
        return error;
    }

    /*

    //TO-DO add xmlminorerror

    // <ILLUMINATION>
     if ((index = nodeNames.indexOf("ILLUMINATION")) == -1)
         return "tag <ILLUMINATION> missing";
     else {
         if (index != ILLUMINATION_INDEX)
             this.onXMLMinorError("tag <ILLUMINATION> out of order");

         //Parse ILLUMINATION block
         if ((error = this.parseIllumination(nodes[index])) != null)
             return error;
     } */
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


  /**
   * Parses the <INITIALS> block.
   */
  parseInitials(initialsNode) {
    var children = initialsNode.children;

    var nodeNames = [];

    for (var i = 0; i < children.length; i++)
      nodeNames.push(children[i].nodeName);

    // Frustum planes
    // (default values)
    this.near = 0.1;
    this.far = 500;
    var indexFrustum = nodeNames.indexOf('frustum');
    if (indexFrustum == -1) {
      this.onXMLMinorError(
        'frustum planes missing; assuming \'near = 0.1\' and \'far = 500\'');
    } else {
      this.near = this.reader.getFloat(children[indexFrustum], 'near');
      this.far = this.reader.getFloat(children[indexFrustum], 'far');

      if (!(this.near != null && !isNaN(this.near))) {
        this.near = 0.1;
        this.onXMLMinorError(
          'unable to parse value for near plane; assuming \'near = 0.1\'');
      } else if (!(this.far != null && !isNaN(this.far))) {
        this.far = 500;
        this.onXMLMinorError(
          'unable to parse value for far plane; assuming \'far = 500\'');
      }

      if (this.near >= this.far) return '\'near\' must be smaller than \'far\'';
    }

    // Checks if at most one translation, three rotations, and one scaling are
    // defined.
    if (initialsNode.getElementsByTagName('translation').length > 1)
      return 'no more than one initial translation may be defined';

    if (initialsNode.getElementsByTagName('rotation').length > 3)
      return 'no more than three initial rotations may be defined';

    if (initialsNode.getElementsByTagName('scale').length > 1)
      return 'no more than one scaling may be defined';

    // Initial transforms.
    this.initialTranslate = [];
    this.initialScaling = [];
    this.initialRotations = [];

    // Gets indices of each element.
    var translationIndex = nodeNames.indexOf('translation');
    var thirdRotationIndex = nodeNames.indexOf('rotation');
    var secondRotationIndex =
      nodeNames.indexOf('rotation', thirdRotationIndex + 1);
    var firstRotationIndex = nodeNames.lastIndexOf('rotation');
    var scalingIndex = nodeNames.indexOf('scale');

    // Checks if the indices are valid and in the expected order.
    // Translation.
    this.initialTransforms = mat4.create();
    mat4.identity(this.initialTransforms);

    if (translationIndex == -1)
      this.onXMLMinorError(
        'initial translation undefined; assuming T = (0, 0, 0)');
    else {
      var tx = this.reader.getFloat(children[translationIndex], 'x');
      var ty = this.reader.getFloat(children[translationIndex], 'y');
      var tz = this.reader.getFloat(children[translationIndex], 'z');

      if (tx == null || ty == null || tz == null) {
        tx = 0;
        ty = 0;
        tz = 0;
        this.onXMLMinorError(
          'failed to parse coordinates of initial translation; assuming zero');
      }

      // TODO: Save translation data
    }

    // TODO: Parse Rotations

    // TODO: Parse Scaling

    // TODO: Parse Reference length

    this.log('Parsed initials');

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

      var from_values = [3];
      var to_values = [3];
      let coords = ['x', 'y', 'z'];

      for (var i = 0; i < 3; i++) {
        var temp;
        temp = this.reader.getFloat(grandChildren[fromIndex], coords[i]);

        if (!(temp != null && !isNaN(temp)))
          return 'unable to parse ' + coords[i] +
            '-coordinate of the perspective for ID = ' + perspectiveId;
        else
          from_values[i] = temp;
      }

      for (var i = 0; i < 3; i++) {
        var temp;
        temp = this.reader.getFloat(grandChildren[toIndex], coords[i]);

        if (!(temp != null && !isNaN(temp)))
          return 'unable to parse ' + coords[i] +
            '-coordinate of the perspective for ID = ' + perspectiveId;
        else
          to_values[i] = temp;
      }

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
  }


  /**
   * Parses the <LIGHTS> node.
   * @param {lights block element} lightsNode
   */
  parseLights(lightsNode) {
    var children = lightsNode.children;

    this.lights = [];
    var numLights = 0;

    var grandChildren = [];
    var nodeNames = [];

    // Any number of lights.
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'omni') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current omni.
      var omniId = this.reader.getString(children[i], 'id');
      if (omniId == null) return 'no ID defined for omni';

      // Get enabled status
      var enabled = this.reader.getString(children[i], 'enabled');
      if (enabled == null) return "Enabled wasn't correctly specified, assuming omni enabled";


      grandChildren = children[i].children;
      // Specifications for the current omni.

      nodeNames = [];
      for (var j = 0; j < grandChildren.length; j++) {
        nodeNames.push(grandChildren[j].nodeName);
      }

      // Gets indices of each element.
      var locationIndex = nodeNames.indexOf('location');
      var ambientIndex = nodeNames.indexOf('ambient');
      var diffuseIndex = nodeNames.indexOf('diffuse');
      var specularIndex = nodeNames.indexOf('specular');


      // Retrieves the omni location.
      var locations = [];
      if (locationIndex != -1) {
        // x
        var x = this.reader.getFloat(grandChildren[locationIndex], 'x');
        if (!(x != null && !isNaN(x)))
          return 'unable to parse x-coordinate of the omni position for ID = ' +
            omniId;
        else
          locations.push(x);

        // y
        var y = this.reader.getFloat(grandChildren[locationIndex], 'y');
        if (!(y != null && !isNaN(y)))
          return 'unable to parse y-coordinate of the omni position for ID = ' +
            omniId;
        else
          locations.push(y);

        // z
        var z = this.reader.getFloat(grandChildren[locationIndex], 'z');
        if (!(z != null && !isNaN(z)))
          return 'unable to parse z-coordinate of the omni position for ID = ' +
            omniId;
        else
          locations.push(z);

        // w
        var w = this.reader.getFloat(grandChildren[locationIndex], 'w');
        if (!(w != null && !isNaN(w) && w >= 0 && w <= 1))
          return 'unable to parse x-coordinate of the omni position for ID = ' +
            omniId;
        else
          locations.push(w);
      } else
        return 'light position undefined for ID = ' + lightId;

      // Retrieves the ambient component.
      var ambientIllumination = [];
      if (ambientIndex != -1) {
        // R
        var r = this.reader.getFloat(grandChildren[ambientIndex], 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
          return 'unable to parse R component of the ambient illumination for ID = ' +
            omniId;
        else
          ambientIllumination.push(r);

        // G
        var g = this.reader.getFloat(grandChildren[ambientIndex], 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
          return 'unable to parse G component of the ambient illumination for ID = ' +
            omniId;
        else
          ambientIllumination.push(g);

        // B
        var b = this.reader.getFloat(grandChildren[ambientIndex], 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
          return 'unable to parse B component of the ambient illumination for ID = ' +
            omniId;
        else
          ambientIllumination.push(b);

        // A
        var a = this.reader.getFloat(grandChildren[ambientIndex], 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
          return 'unable to parse A component of the ambient illumination for ID = ' +
            omniId;
        else
          ambientIllumination.push(a);
      } else
        return 'ambient component undefined for ID = ' + omniId;

      //Retrieve the diffuse component
      var diffuseIllumination = [];
      if (diffuseIndex != -1) {
        // R
        var r = this.reader.getFloat(grandChildren[diffuseIndex], 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
          return 'unable to parse R component of the diffuse illumination for ID = ' +
            omniId;
        else
          diffuseIllumination.push(r);

        // G
        var g = this.reader.getFloat(grandChildren[diffuseIndex], 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
          return 'unable to parse G component of the diffuse illumination for ID = ' +
            omniId;
        else
          diffuseIllumination.push(g);

        // B
        var b = this.reader.getFloat(grandChildren[diffuseIndex], 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
          return 'unable to parse B component of the diffuse illumination for ID = ' +
            omniId;
        else
          diffuseIllumination.push(b);

        // A
        var a = this.reader.getFloat(grandChildren[diffuseIndex], 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
          return 'unable to parse A component of the diffuse illumination for ID = ' +
            omniId;
        else
          diffuseIllumination.push(a);
      } else
        return 'ambient component undefined for ID = ' + omniId;

      //Retrieve the specular component
      var specularIllumination = [];
      if (diffuseIndex != -1) {
        // R
        var r = this.reader.getFloat(grandChildren[specularIndex], 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
          return 'unable to parse R component of the specular illumination for ID = ' +
            omniId;
        else
          specularIllumination.push(r);

        // G
        var g = this.reader.getFloat(grandChildren[specularIndex], 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
          return 'unable to parse G component of the specular illumination for ID = ' +
            omniId;
        else
          specularIllumination.push(g);

        // B
        var b = this.reader.getFloat(grandChildren[specularIndex], 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
          return 'unable to parse B component of the specular illumination for ID = ' +
            omniId;
        else
          specularIllumination.push(b);

        // A
        var a = this.reader.getFloat(grandChildren[specularIndex], 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
          return 'unable to parse A component of the specular illumination for ID = ' +
            omniId;
        else
          specularIllumination.push(a);
      } else
        return 'specular component undefined for ID = ' + omniId;

      //this.lights[lightId] = ;
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
   * Parses the <TEXTURES> block.
   * @param {textures block element} texturesNode
   */
  parseTextures(texturesNode) {
    // TODO: Parse block

    console.log('Parsed textures');

    return null;
  }

  /**
   * Parses the <MATERIALS> node.
   * @param {materials block element} materialsNode
   */
  parseMaterials(materialsNode) {
    // TODO: Parse block
    this.log('Parsed materials');
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
  onXMLMinorErro(message) {
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