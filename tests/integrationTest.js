/* globals it, describe */

// assumes there is a valid dev hub around somewhere

const chai = require('chai');

const expect = chai.expect; // we are using the "expect" style of Chai
const util = require('util');
const request = require('request');

const exec = util.promisify(require('child_process').exec);

const prefix = 'orgcreateauto';
const domain = 'mocha.test';

describe('tests orgCreate', function() {
	this.timeout(80000);

	it('creates a command without json', async function(){
		let command = `sfdx msm:org:create -f tests/exampleConfig.json -u ${prefix} -o ${domain}`;
		const { stdout, stderr } = await exec(command);
		console.log(stdout);
		console.log(stderr);

		expect(stdout).to.have.string('Successfully created scratch org:');
		expect(stdout).to.have.string(prefix);
		expect(stdout).to.have.string(domain);
		expect(stderr).to.equal('');

	});

	it('creates a command with json', async function (){
		let command = `sfdx msm:org:create -f tests/exampleConfig.json -u ${prefix} -o ${domain} --json`;
		let resultJSON;

		try {
			const { stdout, stderr } = await exec(command);
			if (stdout){
				console.log(stdout);
				resultJSON = JSON.parse(stdout);
				// console.log(resultJSON);
			}
			console.log(stderr);
		} catch (err) {
			console.log(err);
		}


		expect(resultJSON.status).to.equal(0);
		expect(resultJSON.result.username).to.have.string(prefix);
		expect(resultJSON.result.username).to.have.string(domain);

	});
});

describe('tests backend username service', function () {
	this.timeout(20000);

	const usernameURL = 'https://unique-username-generator.herokuapp.com/unique';

	it('yields a username', function (done){
		request({
			method: 'post',
			uri: usernameURL,
			body: {
				prefix,
				domain
			},
			json: true
		}, (error, res, body) => {
			expect(body.message).to.have.string(prefix);
			expect(body.message).to.have.string(domain);
			done();
		});
	});


	it('does not yield duplicate usernames', function (done) {
		let username1, username2;

		request({
			method: 'post',
			uri: usernameURL,
			body: {
				prefix,
				domain
			},
			json: true
		}, (error, res, body) => {
			username1 = body.message;
			console.log(username1);

			request({
				method: 'post',
				uri: usernameURL,
				body: {
					prefix,
					domain
				},
				json: true
			}, (error2, res2, body2) => {
				username2 = body2.message;
				console.log(username2);

				expect(username1).to.have.string(prefix);
				expect(username1).to.have.string(domain);
				expect(username2).to.have.string(prefix);
				expect(username2).to.have.string(domain);

				expect(username1).to.not.equal(username2);

				done();
			});
		});


	});
});


describe('tests passwordSet', function () {
	this.timeout(500000);

	it('sets the password', async function () {
		let command = 'sfdx force:org:create -f tests/exampleConfig.json -s';
		await exec(command);
		command = 'sfdx msm:user:password:set -p passw1rd -g User -l User --json';
		const { stdout, stderr } = await exec(command);
		console.log(stdout);

		let resultJSON = JSON.parse(stdout);
		expect(resultJSON.status).to.equal(0);
		expect(resultJSON.result.password).to.equal('passw1rd');

	});
});