/* api_validator.js */

var EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;

function checkInputFields(schema, fields) {
  var validFields = {};
  var invalidFields = {};
  var invalidFieldCount = 0;
  for (var key in fields) {
    if (fields.hasOwnProperty(key)) {
      var value = fields[key];
      var desc = schema[key];
      try {
        switch (desc.type) {
        case "integer":
          value = parseInt(value);
          if (isNaN(value)) {
            throw {};
          }
          if ("maxValue" in desc && value > desc.maxValue) {
            throw {};
          }
          if ("minValue" in desc && value < desc.minValue) {
            throw {};
          }
          break;
        case "date":
          value = new Date(value);
          break;
        case "email":
          value = value.toLowerCase();
          if (!value.match(EMAIL_REGEX)) {
            throw {};
          }
        }
        validFields[key] = value;
      }
      catch (e) {
        invalidFields[key] = value;
        invalidFieldCount += 1;
      }
    }
  }
  if (invalidFieldCount) {
    throw { body: invalidFields };
  }
  return validFields;
}

function isEmpty(fields) {
  for (var key in fields) {
    return false;
  }
  return true;
}

function checkMissingFields(schema, fields) {
  var missingFields = {};
  var missingFieldCount = 0;
  for (var key in schema) {
    var desc = schema[key];
    if (!(key in fields)) {
      if ("defaultValue" in desc) {
        fields[key] = desc.defaultValue;
      }
      else if (desc.required) {
        missingFields[key] = "?";
        missingFieldCount += 1
      }
    }
  }
  if (missingFieldCount) {
    throw { body: missingFields };
  }
  return fields;
}

function validateNew(schema, fields) {
  var validFields = checkInputFields(schema, fields);
  return checkMissingFields(schema, validFields);
}

function prevalidateUpdate(schema, fields) {
  return checkInputFields(schema, fields);
}

function postvalidateUpdate(schema, model, fields) {
  var changingFields = {};
  var invalidFields = {};
  var invalidFieldCount = 0;
  for (var key in fields) {
    if (fields.hasOwnProperty(key)) {
      var value = fields[key];
      var desc = schema[key];
      if (value != model[key]) {
        if (desc.constant) {
          invalidFields[key] = value;
          invalidFieldCount += 1;
        }
        else {
          changingFields[key] = value;
        }
      }
    }
  }
  if (invalidFieldCount) {
    throw { body: invalidFields };
  }
  return isEmpty(changingFields) ? null : changingFields;
}

function ApiValidator(schema) {
  this.schema = schema;
}

ApiValidator.prototype = {
  validateNew: function(fields) {
    return validateNew(this.schema, fields);
  },
  prevalidateUpdate: function(fields) {
    return prevalidateUpdate(this.schema, fields);
  },
  postvalidateUpdate: function(model, fields) {
    return postvalidateUpdate(this.schema, model, fields);
  },
};

module.exports = ApiValidator;
