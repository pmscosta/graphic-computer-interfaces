var rgb_comp = ['r', 'g', 'b', 'a'];

var xyz_comp = ['x', 'y', 'z'];

var xyzw_comp = ['x', 'y', 'z', 'w'];

var rectangle_comp = ['x1', "y1", "x2", "y2"];

var triangle_comp = ['x1', 'y1', 'z1', 'x2', 'y2', 'z2', 'x3', 'y3', 'z3'];

var sphere_comp = ['radius', 'slices', 'stacks'];

var cylinder_comp = ['base','top',"heigth",'slices', 'stacks'];

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

function createOmniLight(scene, light_element, reader) {
  // Get id of the current
  var lightID = reader.getString(light_element, 'id');
  if (lightID == null) return 'no ID defined for light';


  if (scene.lightsID.indexOf(lightID) != -1) {
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

  var new_light = new CGFlight(scene, scene.lights.length);


  if (enabled)
    new_light.enable();
  else
    new_light.disable();

  new_light.setVisible(true);
  new_light.setPosition(location[0], location[1], location[2], location[3]);
  new_light.setAmbient(
      ambientIllumination[0], ambientIllumination[1], ambientIllumination[2],
      ambientIllumination[3]);
  new_light.setDiffuse(
      diffuseIllumination[0], diffuseIllumination[1], diffuseIllumination[2],
      diffuseIllumination[3]);
  new_light.setSpecular(
      specularIllumination[0], specularIllumination[1], specularIllumination[2],
      specularIllumination[3]);

  new_light.update();
  scene.lights.push(new_light);
  scene.lightsID.push(lightID);
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

function createTexture(scene, texture_element, reader, textureID){
  var texturePath = reader.getString(texture_element, 'file');
  if (texturePath == null) return 'no path defined for texture ID = ' + textureID;

  console.log(texturePath);

  var new_texture = new CGFappearance(scene);
  new_texture.loadTexture(texturePath);

  return new_texture;
}


function createSpotLight(scene, light_element, reader) {
  // Get id of the current
  var lightID = reader.getString(light_element, 'id');
  if (lightID == null) return 'no ID defined for light';

  if (scene.lightsID.indexOf(lightID) != -1) {
    return 'ID must be unique for each material (conflict: ID = ' + lightID +
        ')';
  }

  // Get enabled status
  var enabled = reader.getBoolean(light_element, 'enabled');
  if (enabled == null) {
    this.onXMLMinorError(
        'Enabled wasn\'t correctly specified, assuming light enabled');
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

  var new_light = new CGFlight(scene, scene.lights.length);

  if (enabled)
    new_light.enable();
  else
    new_light.disable();

  new_light.setVisible(true);
  new_light.setSpotCutOff(angle);
  new_light.setSpotExponent(exponent);
  new_light.setPosition(location[0], location[1], location[2], location[3]);
  new_light.setSpotDirection(target[0], target[1], target[2]);
  new_light.setAmbient(
      ambientIllumination[0], ambientIllumination[1], ambientIllumination[2],
      ambientIllumination[3]);
  new_light.setDiffuse(
      diffuseIllumination[0], diffuseIllumination[1], diffuseIllumination[2],
      diffuseIllumination[3]);
  new_light.setSpecular(
      specularIllumination[0], specularIllumination[1], specularIllumination[2],
      specularIllumination[3]);

  new_light.update();
  scene.lights.push(new_light);
  scene.lightsID.push(lightID);
}

function parsePrimitive(reader, children, ID) {
  switch (children.nodeName) {
    case 'rectangle':
      var values = [];
      getSpaceComponents(
        reader, rectangle_comp, 'rectangle: ' + ID, values, children);
      return new MyRectangle(this.scene,values);
      break;
    case 'triangle':
      var values = [];
      getSpaceComponents(
        reader, triangle_comp, 'triangle: ' + ID, values,children);
      return new MyTriangle(this.scene,values,1,5,1,5); 
      break;
    case 'sphere':
      var values = [];
      getSpaceComponents(
        reader, sphere_comp, 'sphere: ' + ID, values, children);
      //return new MySphere();
      break;
    case 'cylinder':
      var values = [];
      getSpaceComponents(
        reader, cylinder_comp, 'cylinder: ' + ID, values, children);
      //return new MyCylinder();
      break;
    case 'torus':
      var values = [];
      getSpaceComponents(
        reader, torus_comp, 'torus: ' + ID, values, 0, children);
      //return new MyTorus();
      break;
  }
}