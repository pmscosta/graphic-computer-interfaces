var rgb_comp = ['r', 'g', 'b', 'a'];

var xyz_comp = ['x', 'y', 'z'];

var xyzw_comp = ['x', 'y', 'z', 'w'];

var rectangle_comp = ['x1', 'y1', 'x2', 'y2'];

var triangle_comp = ['x1', 'y1', 'z1', 'x2', 'y2', 'z2', 'x3', 'y3', 'z3'];

var sphere_comp = ['radius', 'slices', 'stacks'];

var cylinder_comp = ['base', 'top', 'height', 'slices', 'stacks'];

var torus_comp = ['inner', 'outer', 'slices', 'loops'];

function getSpaceComponents(reader, components, phase, values, element) {
  for (var i = 0; i < components.length; i++) {
    var temp = reader.getFloat(element, components[i]);

    if (!(temp != null && !isNaN(temp)))
      return 'unable to parse ' + xyz_comp[i] + ' component of the ' + phase;
    else
      values.push(temp);
  }
}

function getRGBComponents(reader, phase, values, element) {
  for (var i = 0; i < 4; i++) {
    var temp = reader.getFloat(element, rgb_comp[i]);

    if (!(temp != null && !isNaN(temp)) || ((i == 3 && temp < 0 && temp > 1)))
      return 'unable to parse ' + rgb_comp[i] + ' component of the ' + phase;
    else
      values.push(temp);
  }
}

function getRotationComponents(reader, phase, values, element) {
  var axis = reader.getString(element, 'axis');

  if (axis == null) return 'unable to parse axis component of the ' + phase;


  var angle = reader.getFloat(element, 'angle');

  if (!(angle != null && !isNaN(angle)))
    return 'unable to parse the angle component of the ' + phase;

  values['axis'] = axis;
  values['angle'] = angle;
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
  var lightID = reader.getString(light_element, 'id');
  if (lightID == null) return 'no ID defined for light';


  if (graph.lights[lightID] != null) {
    return 'ID must be unique for each material (conflict: ID = ' + lightID +
        ')';
  }

  // Get enabled status
  var enabled = reader.getBoolean(light_element, 'enabled');
  if (enabled == null) {
    onXMLMinorError(
        'Enabled wasn\'t correctly specified, assuming light enabled');
    enabled = true;
    ;
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


  // Retrieves the light location.
  var locations = [];
  if (locationIndex != -1) {
    getSpaceComponents(
        reader, xyzw_comp, 'light ID= ' + lightID, locations,
        grandChildren[locationIndex]);
  } else
    return 'light position undefined for ID = ' + lightId;

  // Retrieves the ambient component.
  var ambientIllumination = [];
  if (ambientIndex != -1) {
    getRGBComponents(
        reader, 'lights', ambientIllumination, grandChildren[ambientIndex]);
  } else
    return 'ambient component undefined for ID = ' + lightID;

  // Retrieve the diffuse component
  var diffuseIllumination = [];
  if (diffuseIndex != -1) {
    getRGBComponents(
        reader, 'lights', diffuseIllumination, grandChildren[diffuseIndex]);
  } else
    return 'ambient component undefined for ID = ' + lightID;

  // Retrieve the specular component
  var specularIllumination = [];
  if (specularIndex != -1) {
    getRGBComponents(
        reader, 'lights', specularIllumination, grandChildren[specularIndex]);
  } else
    return 'specular component undefined for ID = ' + lightID;


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

    if (targetIndex != -1) {
      getSpaceComponents(
          reader, xyz_comp, 'lights ID= ' + lightID, target,
          grandChildren[targetIndex]);
    } else
      return 'target component undefined for spot light ID = ' + lightID;

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
  if (emissionIndex != -1) {
    getSpaceComponents(
        reader, rgb_comp, 'material ID= ' + materialID, emissions,
        grandChildren[emissionIndex]);
  } else
    return 'emission component undefined for ID = ' + materialID;

  // Retrieves the ambient component.
  var ambientComponent = [];
  if (ambientIndex != -1) {
    getRGBComponents(
        reader, 'material ID= ' + materialID, ambientComponent,
        grandChildren[ambientIndex]);
  } else
    return 'ambient component undefined for ID = ' + materialID;

  // Retrieve the diffuse component
  var diffuseComponent = [];
  if (diffuseIndex != -1) {
    getRGBComponents(
        reader, 'material ID= ' + materialID, diffuseComponent,
        grandChildren[diffuseIndex]);
  } else
    return 'diffuse component undefined for ID = ' + materialID;

  // Retrieve the specular component
  var specularComponent = [];
  if (specularIndex != -1) {
    getRGBComponents(
        reader, 'material ID= ' + materialID, specularComponent,
        grandChildren[specularIndex]);
  } else
    return 'specular component undefined for ID = ' + materialID;

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

  return new_material;
}

function createTexture(scene, texture_element, reader, textureID) {
  var texturePath = reader.getString(texture_element, 'file');
  if (texturePath == null)
    return 'no path defined for texture ID = ' + textureID;

  var new_texture = new CGFappearance(scene);
  new_texture.loadTexture(texturePath);

  return new_texture;
}

function parsePrimitive(scene, reader, children, ID) {
  switch (children.nodeName) {
    case 'rectangle':
      var values = [];
      getSpaceComponents(
          reader, rectangle_comp, 'rectangle: ' + ID, values, children);
      return new MyRectangle(scene, values);
      break;
    case 'triangle':
      var values = [];
      getSpaceComponents(
          reader, triangle_comp, 'triangle: ' + ID, values, children);
      return new MyTriangle(scene, values, 1, 5, 1, 5);
      break;
    case 'sphere':
      var values = [];
      getSpaceComponents(
          reader, sphere_comp, 'sphere: ' + ID, values, children);
      return new MySphere(scene, values[0], values[1], values[2]);
      break;
    case 'cylinder':
      var values = [];
      getSpaceComponents(
          reader, cylinder_comp, 'cylinder: ' + ID, values, children);
      return new MyCylinder(
          scene, values[0], values[1], values[2], values[3], values[4]);
      break;
    case 'torus':
      var values = [];
      getSpaceComponents(reader, torus_comp, 'torus: ' + ID, values, children);
      return new MyTorus(scene, values[0], values[1], values[2], values[3]);
      break;
  }
}

function dispatchComponent(
    scene, reader, component_spec, componentId, component) {
  switch (component_spec.nodeName) {
    case 'transformation':
      var transformations = component_spec.children;
      for (var i = 0; i < transformations.length; i++) {
        if (transformations[i].nodeName == 'transformationref')
          component.transformation.multiply(
              scene.transformations[reader.getString(transformations[i], 'id')]
                  .getMatrix());
        else {
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
      component.texture = [
        reader.getString(component_spec, 'id'),
        reader.getFloat(component_spec, 'length_s'),
        reader.getFloat(component_spec, 'length_t')
      ];
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