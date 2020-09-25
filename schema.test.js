const fs = require('fs');
const path = require('path');
const jsonSchema = readJsonFile("schema.json");
const validator = new (require('jsonschema').Validator)();

function validate(input) {
	return validator.validate(input, jsonSchema);
}

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
			const actualErrors = result.errors.map(err => err.stack);
			expect(actualErrors.length).toBe(expectedErrors.length);
			expectedErrors.forEach(err => {
				expect(actualErrors).toContain(err);
			});
		}
	} catch (err) {
		console.log(result);
		throw err;
	}
}

describe("Test validation", () => {
	test("No properties", () => {
		const input = {};
		const result = validate(input, jsonSchema);
		check(result,
			'instance is not exactly one from <#/BodyWithProperty2>,<#/BodyWithProperty3>',
			'instance requires property "p1"',
			'instance requires property "p2"',
			'instance requires property "p1"',
			'instance requires property "p3"'
		);
	});

	test("Property 1 only specified", () => {
		const input = {
			p1: "a"
		};
		const result = validate(input, jsonSchema);
		check(result,
			'instance is not exactly one from <#/BodyWithProperty2>,<#/BodyWithProperty3>',
			'instance requires property "p2"',
			'instance requires property "p3"'
		);
	});

	test("Property 1 and 2 specified but property 2 is empty", () => {
		const input = {
			p1: "a",
			p2: ""
		};
		const result = validate(input, jsonSchema);
		check(result,
			'instance is not exactly one from <#/BodyWithProperty2>,<#/BodyWithProperty3>',
			'instance.p2 does not meet minimum property length of 1',
			'instance requires property "p3"'
		);
	});

	test("Property 1 and 2 specified and property 2 is not empty", () => {
		const input = {
			p1: "a",
			p2: "a"
		};
		const result = validate(input, jsonSchema);
		check(result);
	});

	test("Property 1, 2 and 4 specified", () => {
		const input = {
			p1: "a",
			p2: "a",
			p4: "a"
		};
		const result = validate(input, jsonSchema);
		check(result);
	});

	test("Property 1 and 3 specified but property 3 is empty", () => {
		const input = {
			p1: "a",
			p3: ""
		};
		const result = validate(input, jsonSchema);
		check(result,
			'instance is not exactly one from <#/BodyWithProperty2>,<#/BodyWithProperty3>',
			'instance requires property "p2"',
			'instance.p3 does not meet minimum property length of 1'
		);
	});

	test("Property 1 and 3 specified and property 3 is not empty", () => {
		const input = {
			p1: "a",
			p3: "a"
		};
		const result = validate(input, jsonSchema);
		check(result);
	});

	test("Property 1, 3 and 4 specified", () => {
		const input = {
			p1: "a",
			p2: "a",
			p4: "a"
		};
		const result = validate(input, jsonSchema);
		check(result);
	});

	test("All four properties specified", () => {
		const input = {
			p1: "a",
			p2: "a",
			p3: "a",
			p4: "a"
		};
		const result = validate(input, jsonSchema);
		check(result,
			'instance is not exactly one from <#/BodyWithProperty2>,<#/BodyWithProperty3>'
		);
	});
});