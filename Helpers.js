var rgb_comp = ['r', 'g', 'b', 'a'];
var rgb_default = [0, 0, 0, 1];

var xyz_comp = ['x', 'y', 'z'];
var xyz_default = [0, 0, 0];

var xyzw_comp = ['x', 'y', 'z', 'w'];
var xyzw_default = [10, 10, 10, 0];

var rectangle_comp = ['x1', 'y1', 'x2', 'y2'];

var triangle_comp = ['x1', 'y1', 'z1', 'x2', 'y2', 'z2', 'x3', 'y3', 'z3'];

var sphere_comp = ['radius', 'slices', 'stacks'];

var cylinder_comp = ['base', 'top', 'height', 'slices', 'stacks'];

var torus_comp = ['inner', 'outer', 'slices', 'loops'];

var perspective_comp = ['near', 'far', 'angle'];
var perspective_default = [0.1, 500, 0.4];

var ortho_comp = ['near', 'far', 'left', 'right', 'top', 'bottom'];
var ortho_default = [0.1, 500, -5, 5, 5, -5];

function getID(reader, element, storage, description) {
  var ID = reader.getString(element, 'id');

  if (ID == null) {
    console.warn(
        'Warning:  ID not defined for ' + element +
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

function getSpaceComponents(reader, components, phase, values, element) {
  for (var i = 0; i < components.length; i++) {
    var temp = reader.getFloat(element, components[i]);

    if (!(temp != null && !isNaN(temp)))
      return 'unable to parse ' + components[i] + ' component of the ' + phase;
    else
      values.push(temp);
  }
}

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

  if (fromIndex != -1) {
    getSpaceComponents(
        reader, xyz_comp, 'perspective', from_values, grandChildren[fromIndex]);
  } else {
    console.warn(
        'Warning: from component undefined for view = ' + perspectiveId +
        '. Assuming 10 for all');

    from_values = [10, 10, 10];
  }

  if (toIndex != -1) {
    getSpaceComponents(
        reader, xyz_comp, 'perspective', to_values, grandChildren[toIndex]);
  } else {
    console.warn(
        'Warning: to component undefined for view = ' + perspectiveId +
        '. Assuming 0 for all');

    to_values = [0, 0, 0];
  }

  if (graph.defaultPerspectiveId == null)
    graph.defaultPerspectiveId = perspectiveId;

  graph.views[perspectiveId] = [];
  graph.views[perspectiveId]['type'] = 'perspective';
  graph.views[perspectiveId]['near'] = values[0];
  graph.views[perspectiveId]['far'] = values[1];
  graph.views[perspectiveId]['angle'] = values[2];
  graph.views[perspectiveId]['from_values'] = from_values;
  graph.views[perspectiveId]['to_values'] = to_values;
}

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

  if (graph.defaultPerspectiveId == null) graph.defaultPerspectiveId = orthoID;

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


function parseTransformation(reader, element, curr_transformation, ID) {
  switch (element.nodeName) {
    case 'translate':
      var values = [];
      getSpaceComponents(
          reader, xyz_comp, 'transformation: ' + ID, values, element);
      curr_transformation.translate(values);
      break;

    case 'rotate':
      var values = [];
      getRotationComponents(reader, 'transformation: ' + ID, values, element);
      curr_transformation.rotate(values.angle, values.axis);
      break;

    case 'scale':
      var values = [];
      getSpaceComponents(
          reader, xyz_comp, 'transformation: ' + ID, values, element);
      curr_transformation.scale(values);
      break;
  }
}

function createLight(graph, light_element, reader) {
  // Get id of the current
  var lightID = getID(reader, light_element, graph.lights, 'light');
  // Get enabled status
  var enabled = reader.getBoolean(light_element, 'enabled');
  if (enabled == null) {
    console.warn(
        'Warning: Enabled wasn\'t correctly specified, assuming light enabled');
    enabled = true;
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
    var angle = reader.getString(light_element, 'angle');
    var exponent = reader.getString(light_element, 'exponent');

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

function createMaterial(scene, material_element, reader, materialID) {
  // Get shininess status
  var shininess = reader.getFloat(material_element, 'shininess');
  if (shininess == null) {
    onXMLMinorError(
        'shininess wasn\'t correctly specified, assuming shininess 0');
    shininess = 0;
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

function createTexture(scene, texture_element, reader, textureID) {
  var texturePath = reader.getString(texture_element, 'file');
  if (texturePath == null) {
    console.warn(
        'Warning: no path defined for texture = ' + textureID +
        '. Assuming default path for all');

    texturePath = '/scenes/images/default-texture.png';
  }

  var new_texture = new CGFtexture(scene, texturePath);

  return new_texture;
}

function parsePrimitive(scene, reader, children, ID) {
  switch (children.nodeName) {
    case 'rectangle':
      var values = [];
      getSpaceComponents(
          reader, rectangle_comp, 'rectangle: ' + ID, values, children);
      return new MyRectangle(scene, values);

    case 'triangle':
      var values = [];
      getSpaceComponents(
          reader, triangle_comp, 'triangle: ' + ID, values, children);
      return new MyTriangle(scene, values);

    case 'sphere':
      var values = [];
      getSpaceComponents(
          reader, sphere_comp, 'sphere: ' + ID, values, children);
      return new MySphere(scene, values[0], values[1], values[2]);

    case 'cylinder':
      var values = [];
      getSpaceComponents(
          reader, cylinder_comp, 'cylinder: ' + ID, values, children);
      return new MyCylinder(
          scene, values[0], values[1], values[2], values[3], values[4]);

    case 'torus':
      var values = [];
      getSpaceComponents(reader, torus_comp, 'torus: ' + ID, values, children);
      return new MyTorus(scene, values[0], values[1], values[2], values[3]);
  }
}

function dispatchComponent(
    scene, reader, component_spec, componentId, component) {
  switch (component_spec.nodeName) {
    case 'transformation':
      var transformations = component_spec.children;
      for (var i = 0; i < transformations.length; i++) {
        if (transformations[i].nodeName == 'transformationref') {
          component.transformation.multiply(
              scene.transformations[reader.getString(transformations[i], 'id')]
                  .getMatrix());
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

      if (id == 'inherit') {

        component.texture.push(id);

        var l_s = reader.getFloat(component_spec, 'length_s', false);

        var l_t = reader.getFloat(component_spec, 'length_t', false)

        if(l_s !== null)
          component.texture.push(l_s);

        if(l_t !== null)
          component.texture.push(l_t);
          

      } else if (id != 'none') {
        component.texture = [
          id, reader.getFloat(component_spec, 'length_s'),
          reader.getFloat(component_spec, 'length_t')
        ];
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
  }
}

function makeid() {
  var text = '';
  var possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}