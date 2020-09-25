const fs = require('fs');
const path = require('path');
const jsonSchema = readJsonFile("schema.json");
const validator = new (require('jsonschema').Validator)();

function readJsonFile() {
	const fileName = path.resolve(__dirname, ...arguments);
	return JSON.parse(fs.readFileSync(fileName, 'utf8'));
}

function check(result) {
	const expectedErrors = [...arguments].slice(1);
	try {
		if (!expectedErrors.length)
			expect(result.valid).toBeTruthy();
		else {
			expect(result.valid).toBeFalsy();
			expect(result.errors.map(err => err.stack)).toStrictEqual(expectedErrors);
		}
	} catch (err) {
		console.log(result);
		throw err;
	}
}

describe("Test validation", () => {
	test("No properties", () => {
		const input = {};
		const result = validator.validate(input, jsonSchema);
		check(result,
			'instance is not exactly one from <#/BodyWithProperty2>,<#/BodyWithProperty3>'
			// Should also include messages from validation of the two alternatives, ie two
			// instances of "p1 is missing" and one each of "p2 is missing" and "p3 is missing".
		);
	});

	test("Property 1 only specified", () => {
		const input = {
			p1: "a"
		};
		const result = validator.validate(input, jsonSchema);
		check(result,
			'instance is not exactly one from <#/BodyWithProperty2>,<#/BodyWithProperty3>'
			// Should also include messages from validation of the two alternatives, ie 
			// "p2 is missing" and "p3 is missing".
		);
	});

	test("Property 1 and 2 specified but property 2 is empty", () => {
		const input = {
			p1: "a",
			p2: ""
		};
		const result = validator.validate(input, jsonSchema);
		check(result,
			'instance is not exactly one from <#/BodyWithProperty2>,<#/BodyWithProperty3>'
			// Should also include messages from validation of the two alternatives, ie 
			// "p2 is too short" and "p3 is missing".
		);
	});

	test("Property 1 and 2 specified and property 2 is not empty", () => {
		const input = {
			p1: "a",
			p2: "a"
		};
		const result = validator.validate(input, jsonSchema);
		check(result);
	});

	test("Property 1, 2 and 4 specified", () => {
		const input = {
			p1: "a",
			p2: "a",
			p4: "a"
		};
		const result = validator.validate(input, jsonSchema);
		check(result);
	});

	test("Property 1 and 3 specified but property 3 is empty", () => {
		const input = {
			p1: "a",
			p3: ""
		};
		const result = validator.validate(input, jsonSchema);
		check(result,
			'instance is not exactly one from <#/BodyWithProperty2>,<#/BodyWithProperty3>'
			// Should also include messages from validation of the two alternatives, ie 
			// "p2 is missing" and "p3 is too short".
		);
	});

	test("Property 1 and 3 specified and property 3 is not empty", () => {
		const input = {
			p1: "a",
			p3: "a"
		};
		const result = validator.validate(input, jsonSchema);
		check(result);
	});

	test("Property 1, 3 and 4 specified", () => {
		const input = {
			p1: "a",
			p2: "a",
			p4: "a"
		};
		const result = validator.validate(input, jsonSchema);
		check(result);
	});

	test("All four properties specified", () => {
		const input = {
			p1: "a",
			p2: "a",
			p3: "a",
			p4: "a"
		};
		const result = validator.validate(input, jsonSchema);
		check(result,
				'instance is not exactly one from <#/BodyWithProperty2>,<#/BodyWithProperty3>'
			);
	});
});