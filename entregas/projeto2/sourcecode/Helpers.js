var rgb_comp = ['r', 'g', 'b', 'a'];
var rgb_default = [0, 0, 0, 1];

var xyz_comp = ['x', 'y', 'z'];
var xyz_default = [0, 0, 0];

var xyzw_comp = ['x', 'y', 'z', 'w'];
var xyzw_default = [10, 10, 10, 0];

var rectangle_comp = ['x1', 'y1', 'x2', 'y2'];
var rec_default = [0, 0, 1, 1];

var triangle_comp = ['x1', 'y1', 'z1', 'x2', 'y2', 'z2', 'x3', 'y3', 'z3'];
var triangle_def = [0, 1, 0, 0, 1, 0, 0, 0, 0];

var sphere_comp = ['radius', 'slices', 'stacks'];
var sphere_def = [1, 20, 20];

var cylinder_comp = ['base', 'top', 'height', 'slices', 'stacks'];
var cylinder_def = [1, 1, 1, 20, 20];

var torus_comp = ['inner', 'outer', 'slices', 'loops'];
var torus_def = [0.1, 0.4, 20, 20];

var perspective_comp = ['near', 'far', 'angle'];
var perspective_default = [0.1, 5, 0.4];

var ortho_comp = ['near', 'far', 'left', 'right', 'top', 'bottom'];
var ortho_default = [0.1, 5, -5, 5, 5, -5];

var angle_comp = ['angle'];
var angle_def = 0;

var exponent_comp = ['exponent'];
var exponent_def = 0;

var linear_comp = ['id', 'span'];
var linear_def = [1, 5];

var control_comp = ['xx', 'yy', 'zz'];
var control_def = [1, 1, 1];

var circular_comp = ['id', 'span', 'center', 'radius', 'startang', 'rotang'];
var circular_def = [1, 1, "1 1 1", 1, 0, 90];

var plane_comp = ['npartsU', 'npartsV'];
var plane_def = [1, 1];

var patch_comp = ['npointsU', 'npointsV', 'npartsU', 'npartsV'];
var patch_def = [1, 1, 1, 1];

var terrain_comp = ['idtexture', 'idheightmap', 'parts', 'heightscale'];
var terrain_def =['x', 'x', '20', '0.2', '1'];

var water_comp = ['idtexture', 'idwavemap', 'parts', 'heightscale', 'texscale'];
var water_def =['x', 'x', '20', '0.2', '1'];

var circular_comp = ['id', 'span', 'center', 'radius', 'startang', 'rotang'];

var from_def = [10, 10, 10];
var to_def = [0, 0, 0];

var scale_def = [1, 1, 1];
var trans_def = [1, 1, 1];

/**
 * @param  {} reader
 * @param  {} components
 * @param  {} values
 * @param  {} element
 */
function getTerrainValues(reader, components, values, element) {

  var idtexture = reader.getString(element, components[0]);
  var idheightmap = reader.getString(element, components[1]);
  
  var parts = getValueOrDefault(reader, components[2], 'Terrain parts', element, terrain_def[2]);
  
  var heightscale = getValueOrDefault(reader, components[3], 'Terrain heighscale', element, terrain_def[3]);
 
  values.push(idtexture, idheightmap, parts, heightscale);
}

/**
 * @param  {} reader
 * @param  {} components
 * @param  {} values
 * @param  {} element
 */
function getWaterValues(reader, components, values, element) {

  var idtexture = reader.getString(element, components[0]);

  var idwavemap = reader.getString(element, components[1]);

  var parts = getValueOrDefault(reader, components[2], 'Water parts', element, water_def[2]);

  var heightscale = getValueOrDefault(reader, components[3], 'Water heighscale', element, water_def[3]);

  var texscale = getValueOrDefault(reader, components[4], 'Water texscale', element, water_def[4]);

  values.push(idtexture, idwavemap, parts, heightscale, texscale);
}



/**
 * @param  {} reader
 * @param  {} components
 * @param  {} values
 * @param  {} element
 */
function getCircularAnimationValues(reader, components, values, element, id) {

  var span = getValueOrDefault(reader, components[1], 'Circular Animation ' + id + ' Span', element, circular_def[1]);

  var center = getStringOrDefault(reader, components[2], 'Circular Animation ' + id + ' Center', element, circular_def[2]);

  var radius = getValueOrDefault(reader, components[3], 'Circular Animation ' + id + ' Radius', element, circular_def[3]);

  var startang = getValueOrDefault(reader, components[4], 'Circular Animation ' + id + ' Startang', element, circular_def[4]);

  var rotang = getValueOrDefault(reader, components[5], 'Circular Animation ' + id + ' Rotang', element, circular_def[5]);

  values.push(span, center, radius, startang, rotang);

}


/**
 * Reads an ID from the XML file and if it is a repeated one generates
 * a random one until it's not and stores it.
 * @param {XML Reader} reader
 * @param {XML Child} element
 * @param {ID Storage} storage
 * @param {string} description
 */
function getID(reader, element, storage, description) {
  var ID = reader.getString(element, 'id');

  if (ID == null || ID.length == 0) {
    console.warn(
      'Warning:  ID not defined for ' + description +
      '. Generating a random one.');

    ID = makeid();
  }

  while (storage[ID] != null) {
    console.warn(
      'ID must be unique for each ' + description + ' (conflict: ID = ' + ID +
      '). Generating a new one');
    ID = makeid();

  }

  return ID;
}



/**
 * Reads some values from the XML as defined in [components] and outputs them in
 * [values]. If some or all values are not defined, returns default ones.
 * @param {XML Reader} reader
 * @param {Default Values} components
 * @param {string} phase
 * @param {output array} values
 * @param {XML Child} element
 * @param {Default Values} def
 */
function getValuesOrDefault(reader, components, phase, values, element, def) {
  if (element == null) {
    console.warn(
      'Warning: ' + phase + 'component undefined. Assuming ' + def +
      'for all');
    values.push(...def);
    return;
  }

  for (var i = 0; i < components.length; i++) {
    var temp = reader.getFloat(element, components[i]);

    if (!(temp != null && !isNaN(temp))) {
      console.warn(
        'Warning: ' + components[i] + ' not specified or invalid in ' +
        phase + ' assuming ' + components[i] + ' = ' + def[i])
      values.push(def[i]);
    } else
      values.push(temp);
  }
}

/**
 * Reads value from the XML as defined in [component] and returns it. If some or all values are not defined, returns default ones.
 * @param {XML Reader} reader
 * @param {Default Values} components
 * @param {string} phase
 * @param {output array} values
 * @param {XML Child} element
 * @param {Default Values} def
 */
function getValueOrDefault(reader, component, phase, element, def) {

  var result = 0;

  if (element == null) {
    console.warn(
      'Warning: ' + phase + ' component undefined. Assuming ' + def);
    result = def;
    return;
  }


  var temp = reader.getFloat(element, component);

  if (!(temp != null && !isNaN(temp))) {
    console.warn(
      'Warning: ' + component + ' not specified or invalid in ' +
      phase + ' assuming ' + component + ' = ' + def)
    result = def;
  } else
    result = temp;

  return result;

}

/**
 * Reads string from the XML as defined in [component] and returns it. If some or all strings are not defined, returns default ones.
 * @param {XML Reader} reader
 * @param {Default Values} components
 * @param {string} phase
 * @param {output array} values
 * @param {XML Child} element
 * @param {Default Values} def
 */
function getStringOrDefault(reader, component, phase, element, def) {

  var result = 0;

  if (element == null) {
    console.warn(
      'Warning: ' + phase + ' component undefined. Assuming ' + def);
    result = def;
    return;
  }


  var temp = reader.getString(element, component);

  if (temp == null) {
    console.warn(
      'Warning: ' + component + ' not specified or invalid in ' +
      phase + ' assuming ' + component + ' = ' + def)
    result = def;
  } else
    result = temp;

  return result;
}


/**
 * Reads RGB components from a child in the XML. If such values are not defined,
 * sets 0 as default.
 * @param {XML Reader} reader
 * @param {string} phase
 * @param {Output array} values
 * @param {XML child} element
 */
function getRGBComponents(reader, phase, values, element) {
  for (var i = 0; i < 4; i++) {
    var temp = reader.getFloat(element, rgb_comp[i]);

    if (!(temp != null && !isNaN(temp)) || ((i == 3 && temp < 0 && temp > 1))) {
      console.warn(
        'Warning: unable to parse ' + rgb_comp[i] + ' component of the ' +
        phase + 'assuming 0.')
      values.push(0);
    } else
      values.push(temp);
  }
}



/**
 * Reads he rotation values from the XML file,
 * if the angle is not defined, the default is 0,
 * 'x' for the axis.
 * @param {XML Reader} reader
 * @param {string} phase
 * @param {Output array} values
 * @param {XML child} element
 */
function getRotationComponents(reader, phase, values, element) {
  var axis = reader.getString(element, 'axis');

  if (axis == null) {
    console.warn(
      'Warning:  unable to parse the axis of component ' + phase +
      '. Assuming axis=x.');
    axis = 'x';
  }

  var angle = reader.getFloat(element, 'angle');

  if (!(angle != null && !isNaN(angle))) {
    console.warn(
      'Warning:  unable to parse the angle of the component ' + phase +
      '. Assuming angle = 0.')
    angle = 0;
  }

  values['axis'] = axis;
  values['angle'] = angle;
}



/**
 * Parses a perspective form the XML file
 * @param {Scene Graph} graph - to store the perspectives
 * @param {XML Reader} reader
 * @param {XML perspective} element
 */
function parsePerspective(graph, reader, element) {
  var perspectiveId = getID(reader, element, graph.views, 'perspective view');

  var values = [];

  getValuesOrDefault(
    reader, perspective_comp, 'perspective ' + perspectiveId, values, element,
    perspective_default);

  grandChildren = element.children;

  // specifications for the current perspective
  nodeNames = [];
  for (var j = 0; j < grandChildren.length; j++) {
    nodeNames.push(grandChildren[j].nodeName);
  }

  var fromIndex = nodeNames.indexOf('from');
  var toIndex = nodeNames.indexOf('to');


  var from_values = [];
  var to_values = [];

  getValuesOrDefault(
    reader, xyz_comp, 'perspective: ' + perspectiveId, from_values,
    grandChildren[fromIndex], from_def);

  getValuesOrDefault(
    reader, xyz_comp, 'perspective: ' + perspectiveId, to_values,
    grandChildren[toIndex], to_def);


  if (graph.defaultPerspectiveId == null || graph.defaultPerspectiveId.length == 0) {
    graph.onXMLMinorError("assumed default view: " + perspectiveId);
    graph.defaultPerspectiveId = perspectiveId;
  }

  graph.views[perspectiveId] = [];
  graph.views[perspectiveId]['type'] = 'perspective';
  graph.views[perspectiveId]['near'] = values[0];
  graph.views[perspectiveId]['far'] = values[1];
  graph.views[perspectiveId]['angle'] = values[2];
  graph.views[perspectiveId]['from_values'] = from_values;
  graph.views[perspectiveId]['to_values'] = to_values;
}



/**
 * Parses an ortho view from the XML file.
 * @param {Scene Graph} graph - to store the ortho view
 * @param {XML Reader} reader
 * @param {XML orth} element
 */
function parseOrtho(graph, reader, element) {
  var orthoID = getID(reader, element, graph.views, 'ortho view');

  var values = [];

  getValuesOrDefault(
    reader, ortho_comp, 'ortho ' + orthoID, values, element, ortho_default);

  grandChildren = element.children;

  // specifications for the current perspective
  nodeNames = [];
  for (var j = 0; j < grandChildren.length; j++) {
    nodeNames.push(grandChildren[j].nodeName);
  }

  var fromIndex = nodeNames.indexOf('from');
  var toIndex = nodeNames.indexOf('to');
  var from_values = [];
  var to_values = [];

  getValuesOrDefault(
    reader, xyz_comp, 'view: ' + orthoID + ' from ', from_values,
    grandChildren[fromIndex], [10, 10, 10]);


  getValuesOrDefault(
    reader, xyz_comp, 'view: ' + orthoID + ' to ', to_values,
    grandChildren[toIndex], xyz_default);

  if (graph.defaultPerspectiveId == null || graph.defaultPerspectiveId.length == 0) {
    graph.onXMLMinorError("assumed default view: " + orthoID);
    graph.defaultPerspectiveId = orthoID;
  }
  graph.views[orthoID] = [];
  graph.views[orthoID]['type'] = 'ortho';
  graph.views[orthoID]['near'] = values[0];
  graph.views[orthoID]['far'] = values[1];
  graph.views[orthoID]['left'] = values[2];
  graph.views[orthoID]['right'] = values[3];
  graph.views[orthoID]['top'] = values[4];
  graph.views[orthoID]['bottom'] = values[5];
  graph.views[orthoID]['position'] = from_values;
  graph.views[orthoID]['target'] = to_values;
}



/**
 * Parses and store a transformation form the XML file.
 * It calculates all the transformations and store the final/resulting matrix.
 * @param {XML Reader} reader
 * @param {XML transformation} element
 * @param {Transformation object} curr_transformation
 * @param {Transformation ID} ID
 */
function parseTransformation(reader, element, curr_transformation, ID) {
  switch (element.nodeName) {
    case 'translate':
      var values = [];
      getValuesOrDefault(
        reader, xyz_comp, 'translate: ' + ID, values, element,
        trans_def);
      curr_transformation.translate(values);
      break;

    case 'rotate':
      var values = [];
      getRotationComponents(reader, 'rotate: ' + ID, values, element);
      curr_transformation.rotate(values.angle, values.axis);
      break;

    case 'scale':
      var values = [];
      getValuesOrDefault(
        reader, xyz_comp, 'scale: ' + ID, values, element,
        scale_def);
      curr_transformation.scale(values);
      break;
  }
}



/**
 * Parses and creates a light from the XML file
 * @param {Scene Graph} graph
 * @param {XML light} light_element
 * @param {XML reader} reader
 */
function createLight(graph, light_element, reader) {
  // Get id of the current
  var lightID = getID(reader, light_element, graph.lights, 'light');
  // Get enabled status
  var enabled = reader.getBoolean(light_element, 'enabled', false);

  if (enabled == null) {
    console.warn(
      'Warning: Enabled wasn\'t correctly specified, assuming light disabled');
    enabled = false;
  }

  grandChildren = light_element.children;
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

  // Retrieves the location component
  var locations = [];
  getValuesOrDefault(
    reader, xyzw_comp, 'light: ' + lightID + ' location ', locations,
    grandChildren[locationIndex], xyzw_default);

  // Retrieves the ambient component.
  var ambientIllumination = [];
  getValuesOrDefault(
    reader, rgb_comp, 'light: ' + lightID + ' ambient ', ambientIllumination,
    grandChildren[ambientIndex], rgb_default);

  // Retrieve the diffuse component
  var diffuseIllumination = [];
  getValuesOrDefault(
    reader, rgb_comp, 'light: ' + lightID + ' diffuse ', diffuseIllumination,
    grandChildren[diffuseIndex], rgb_default);


  // Retrieve the specular component
  var specularIllumination = [];
  getValuesOrDefault(
    reader, rgb_comp, 'light: ' + lightID + ' specular ',
    specularIllumination, grandChildren[specularIndex], rgb_default);

  graph.lights[lightID] = [];
  graph.lights[lightID]['type'] = 'omni';
  graph.lights[lightID]['enabled'] = enabled;
  graph.lights[lightID]['location'] = locations;
  graph.lights[lightID]['ambient'] = ambientIllumination;
  graph.lights[lightID]['diffuse'] = diffuseIllumination;
  graph.lights[lightID]['specular'] = specularIllumination;

  if (light_element.nodeName == 'spot') {
    /*  var angle = reader.getString(light_element, 'angle');
     var exponent = reader.getString(light_element, 'exponent'); */


    var angle = getValueOrDefault(
      reader, angle_comp, 'light: ' + lightID + ' angle ',
      light_element, angle_def);

    var exponent = getValueOrDefault(
      reader, exponent_comp, 'light: ' + lightID + ' exponent ',
      light_element, exponent_def);



    var target = [];
    var targetIndex = nodeNames.indexOf('target');

    getValuesOrDefault(
      reader, xyz_comp, 'light: ' + lightID + ' target ', target,
      grandChildren[targetIndex], xyz_default);


    graph.lights[lightID]['type'] = 'spot';
    graph.lights[lightID]['enabled'] = enabled;
    graph.lights[lightID]['angle'] = angle;
    graph.lights[lightID]['exponent'] = exponent;
    graph.lights[lightID]['target'] = target;
  }
}



/**
 * Parses and creates a material from the XML
 * @param {XMLScene} scene  - material constructor requeries the scene
 * @param {XML material} material_element
 * @param {XML Reader} reader
 * @param {string} materialID
 */
function createMaterial(scene, material_element, reader, materialID) {
  // Get shininess status
  var shininess = reader.getFloat(material_element, 'shininess');
  if (shininess == null || isNaN(shininess)) {
    console.warn(
      'shininess wasn\'t correctly specified, assuming shininess 0.1');
    shininess = 0.1;
  }

  grandChildren = material_element.children;
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
  getValuesOrDefault(
    reader, rgb_comp, 'material: ' + materialID + ' emission ', emissions,
    grandChildren[emissionIndex], rgb_default);

  // Retrieves the ambient component.
  var ambientComponent = [];
  getValuesOrDefault(
    reader, rgb_comp, 'material: ' + materialID + ' ambient ',
    ambientComponent, grandChildren[ambientIndex], rgb_default);

  // Retrieve the diffuse component
  var diffuseComponent = [];
  getValuesOrDefault(
    reader, rgb_comp, 'material: ' + materialID + ' diffuse ',
    diffuseComponent, grandChildren[diffuseIndex], rgb_default);

  // Retrieve the specular component
  var specularComponent = [];
  getValuesOrDefault(
    reader, rgb_comp, 'material: ' + materialID + ' specular ',
    specularComponent, grandChildren[specularIndex], rgb_default);

  var new_material = new CGFappearance(scene);

  new_material.setAmbient(
    ambientComponent[0], ambientComponent[1], ambientComponent[2],
    ambientComponent[3]);
  new_material.setDiffuse(
    diffuseComponent[0], diffuseComponent[1], diffuseComponent[2],
    diffuseComponent[3]);
  new_material.setSpecular(
    specularComponent[0], specularComponent[1], specularComponent[2],
    specularComponent[3]);
  new_material.setEmission(
    emissions[0], emissions[1], emissions[2], emissions[3]);

  new_material.setShininess(shininess);

  new_material.setTextureWrap('REPEAT', 'REPEAT');

  return new_material;
}


/**
 * Parses and creates a CGFTexture Object from the XML file
 * @param {XMLScene} scene - CGFtexture constructor requires scene
 * @param {XML texture} texture_element
 * @param {XML reader} reader
 * @param {string} textureID
 */
function createTexture(scene, texture_element, reader, textureID) {
  var texturePath = reader.getString(texture_element, 'file');
  if (texturePath == null || texturePath == 0) {
    console.warn(
      'Warning: no path defined for texture = ' + textureID +
      '. Assuming default path for all');

    texturePath = '/scenes/images/default-texture.png';
  }
  var tex = new XMLHttpRequest();
  tex.open("HEAD", texturePath, false);
  tex.send();

  if (tex.status == 404) {
    var new_texture = new CGFtexture(scene, '/scenes/images/signal.png');
    console.warn(
      'Warning: Invalid path defined for texture = ' + textureID +
      '. Assuming signal path for all');
  } else {
    var new_texture = new CGFtexture(scene, texturePath);
  }

  return new_texture;
}


/**
 * @param  {} scene
 * @param  {} reader
 * @param  {} children
 * @param  {} ID
 */
function parsePrimitive(scene, reader, children, ID) {
  switch (children.nodeName) {
    case 'rectangle':
      var values = [];

      getValuesOrDefault(
        reader, rectangle_comp, 'rectangle: ' + ID, values, children,
        rec_default);

      return new MyRectangle(scene, values);

    case 'triangle':
      var values = [];

      getValuesOrDefault(
        reader, triangle_comp, 'triangle: ' + ID, values, children,
        triangle_def);
      return new MyTriangle(scene, values);

    case 'sphere':
      var values = [];
      getValuesOrDefault(
        reader, sphere_comp, 'sphere: ' + ID, values, children, sphere_def);
      return new MySphere(scene, values[0], values[1], values[2]);

    case 'cylinder':
      var values = [];
      getValuesOrDefault(
        reader, cylinder_comp, 'cylinder: ' + ID, values, children,
        cylinder_def);
      return new MyCylinder(
        scene, values[0], values[1], values[2], values[3], values[4]);

    case 'torus':
      var values = [];
      getValuesOrDefault(
        reader, torus_comp, 'torus: ' + ID, values, children, torus_def);
      return new MyTorus(scene, values[0], values[1], values[2], values[3]);

    case 'patch':
      var values = [];
      getValuesOrDefault(
        reader, patch_comp, 'patch: ' + ID, values, children, patch_def);

      let grandChildren = children.children;
      let controlPoints = [];

      for (let i = 0; i < grandChildren.length; i++) {
        var controlPoint = [];
        getValuesOrDefault(
          reader, control_comp, 'control point: ', controlPoint, grandChildren[i], control_def);
        controlPoints.push(controlPoint);

      }
      return new Patch(scene, values[0], values[1], values[2], values[3], controlPoints);

    case 'plane':
      var values = [];
      getValuesOrDefault(
        reader, plane_comp, 'plane: ' + ID, values, children, plane_def);
      return new Plane(scene, values[0], values[1]);

    case 'vehicle':
      return new Vehicle(scene);

    case 'cylinder2':
      var values = [];
      getValuesOrDefault(
        reader, cylinder_comp, 'cylinder: ' + ID, values, children,
        cylinder_def);
      return new Cylinder2(
        scene, values[0], values[1], values[2], values[3], values[4]);

    case 'terrain':
      var values = [];
      getTerrainValues(
        reader, terrain_comp, values, children);


      return new Terrain(scene, values[0], values[1], values[2], values[3]);

    case 'water':
      var values = [];
      getWaterValues(
        reader, water_comp, values, children);
      return new Water(scene, values[0], values[1], values[2], values[3], values[4]);
  }
}


/**
 * Parses and creates a component and all of it's children in one.
 * @param {XMLScene} scene
 * @param {XMLreader} reader
 * @param {XML component} component_spec
 * @param {string} componentId
 * @param {Component Object} component - object created by us to store all the transformatios/texture/materials
 */
function dispatchComponent(
  scene, reader, component_spec, componentId, component) {
  switch (component_spec.nodeName) {
    case 'transformation':
      var transformations = component_spec.children;
      for (var i = 0; i < transformations.length; i++) {
        if (transformations[i].nodeName == 'transformationref') {
          var transId = reader.getString(transformations[i], 'id');
          if (scene.transformations[transId] == undefined) {
            scene.onXMLMinorError("Invalid transformation reference ignoring transformation.");
            continue;
          }
          component.transformation.multiply(scene.transformations[transId].getMatrix());
        } else {
          parseTransformation(
            reader, transformations[i], component.transformation,
            componentId);
        }
      }
      break;
    case 'materials':
      var materials = component_spec.children;
      for (var i = 0; i < materials.length; i++) {
        component.materials[i] = reader.getString(materials[i], 'id');
      }
      break;
    case 'texture':

      var id = reader.getString(component_spec, 'id');

      component.texture.push(id);

      if (id == 'inherit') {
        var l_s = reader.getFloat(component_spec, 'length_s', false);

        var l_t = reader.getFloat(component_spec, 'length_t', false)

        if (l_s !== null) component.texture.push(l_s);

        if (l_t !== null) component.texture.push(l_t);


      } else if (id != 'none') {
        component.texture.push(
          reader.getFloat(component_spec, 'length_s'),
          reader.getFloat(component_spec, 'length_t'));
      }
      break;
    case 'children':
      var childs = component_spec.children;
      for (var i = 0; i < childs.length; i++) {
        var id = reader.getString(childs[i], 'id');
        component.id = id;
        if (childs[i].nodeName == 'componentref') {
          component.componentChildren.push(id);
        } else {
          component.primitiveChildren.push(id);
        }
      }
      break;
    case 'animations':
      var childs = component_spec.children;
      for (var i = 0; i < childs.length; i++) {
        var id = reader.getString(childs[i], 'id');
        component.animation.push(id);
      }
  }
}



/**
 * @param  {} scene
 * @param  {} animation_element
 * @param  {} reader
 * @param  {} animationID
 */
function createAnimation(scene, animation_element, reader, animationID) {

  var span = reader.getFloat(animation_element, 'span');

  switch (animation_element.nodeName) {
    case 'linear':

      var points = [];

      for (var i = 0; i < animation_element.children.length; i++) {
        var values = [];

        getValuesOrDefault(reader, control_comp, 'control: ', values,
          animation_element.children[i], control_def);

        points.push(values);
      }

      return new LinearAnimation(scene, points, span);

    case 'circular':

      var values = [];

      getCircularAnimationValues(
        reader, circular_comp, values, animation_element, animationID);

      return new CircularAnimation(scene, values[1], values[2], values[3], values[4], values[0]);
  }


}

/**
 * Generates a random ID with length 5
 */
function makeid() {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  console.warn("New ID is " + text);

  return text;
}