var rgb_comp = ['r', 'g', 'b', 'a'];

var xyz_comp = ['x', 'y', 'z'];

var xyzw_comp = ['x', 'y', 'z', 'w'];

function getSpaceComponents(
    reader, components, phase, values, index, children) {
  for (var i = 0; i < components.length; i++) {
    var temp = reader.getFloat(children[index], components[i]);

    if (!(temp != null && !isNaN(temp)))
      return 'unable to parse ' + xyz_comp[i] + ' component of the ' + phase;
    else
      values.push(temp);
  }
}

function getRGBComponents(reader, phase, values, index, children) {
  for (var i = 0; i < 4; i++) {
    var temp = reader.getFloat(children[index], rgb_comp[i]);

    if (!(temp != null && !isNaN(temp)) || ((i == 3 && temp >= 0 && temp <= 1)))
      return 'unable to parse ' + rgb_comp[i] + ' component of the ' + phase;
    else
      values.push(temp);
  }
}

function getRotationComponents(reader, phase, values, index, children) {
  var axis = reader.getString(children[index], 'axis');

  if (axis == null) return 'unable to parse axis component of the ' + phase;


  var angle = reader.getFloat(children[index], 'angle');

  if (!(angle != null && !isNaN(angle)))
    return 'unable to parse the angle component of the ' + phase;

  values['axis'] = axis;
  values['angle'] = angle;
}


function parseTransformation(reader, children, j, curr_transformation, ID) {
  switch (children[j].nodeName) {
    case 'translate':
      var values = [];
      getSpaceComponents(
          reader, xyz_comp, 'transformation: ' + ID, values, j, children);
      curr_transformation.translate(values);
      break;

    case 'rotate':
      var values = [];
      getRotationComponents(
          reader, 'transformation: ' + ID, values, j, children);
      curr_transformation.rotate(values.angle, values.axis);
      break;

    case 'scale':
      var values = [];
      getSpaceComponents(
          reader, xyz_comp, 'transformation: ' + ID, values, j, children);
      curr_transformation.scale(values);
      break;
  }
}
