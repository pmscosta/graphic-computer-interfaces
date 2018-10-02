var rgb_comp = ['r', 'g', 'b', 'a'];

var xyz_comp = ['x', 'y', 'z'];

var xyzw_comp = ['x', 'y', 'z', 'w'];

function getSpaceComponents(reader, components, phase, values, index, children) {
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