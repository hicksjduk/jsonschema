# Schema validation test

This project provides a testcase which demonstrates a shortcoming in the error messages
issued by the `jsonschema` library when the schema being used contains a "oneOf"
specification. If validation fails in both sub-schemas, the only error issued is that
the validated document is not exactly one from the possible alternatives. I think that
that message is fine, but the errors found when validating against the alternatives should
also be included.

### Update

I raised [an issue on the library](https://github.com/tdegrunt/jsonschema/issues/309) about this, 
and it turned out that the desired behaviour can be switched on by setting the `nestedErrors` 
option. This is done by specifying, as the third parameter to the validator after the input object
and the schema, an object in which the property `nestedErrors` exists and has a truthy value. 
For example:

```javascript
validator.validate(input, jsonSchema, {nestedErrors: true})
```
The tests in this project have been updated accordingly, and they all pass.

The issue has been updated to reflect that the desired behaviour is available, but the documentation
of the option is lacking.

## Scenario description

The root element of the document that is described by the schema can contain up to three of the four
properties p1, p2, p3 and p4:
* p1 must be present
* Either p2 or p3 must be present
* p4 may or may not be present
All four properties are strings, and may not be blank.

This is described in [the schema file](schema.json) by defining two sub-schemas for the valid
combinations:
* `BodyWithProperty2`, which requires p1 and p2, and also allows p4.
* `BodyWithProperty3`, which requires p1 and p3, and also allows p4.

Note, however, that the sub-schemas allow additional properties; so a document that contains all
of p1, p2 and p3 will pass validation against both sub-schemas but fail because it should pass
against only one.

Then the root element of the document is described using a "oneOf" element that references the
two possible sub-schemas.

I suspect that there may be other ways to represent this, but this seems to me to be the most
elegant and readable way to do it.

When I validate various documents against this schema, I expect that:
* If the document can be validated against both sub-schemas, validation should fail with a message
reflecting that it did not match exactly one.
* If the document can be validated against one sub-schema but not the other, validation should
succeed.
* If the document cannot be validated against either sub-schema, validation should fail: there
should be a message reflecting that it did not match exactly one, **but there should also be
messages that show why validation of the sub-schemas failed**.

It is the latter case that I don't think is working correctly, since the only message issued is the
one that says the data did not match exactly one schema; and this means that the output is not
useful to someone who doesn't have access to the schema.

## Tests

[Some Jest tests](schema.test.js) are included to illustrate the scenario. 
To run these, in the root directory of the project issue the following commands:
* `npm ci` (only needs to be done the first time)
* `npm test`

Each test specifies the error messages that I think should be issued, so those where the errors
from the nested schema validation are not thrown fail. 
