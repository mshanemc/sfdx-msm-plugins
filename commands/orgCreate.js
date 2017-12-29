const request = require('request');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const flags = [
	{
		name: 'userprefix',
		char: 'u',
		description: 'first part of the generated username.  Example: \'shane\' produces shane1@demo.org, shane2@demo.org',
		hasValue: true,
		required: true
	}, {
		name: 'userdomain',
		char: 'o',
		description: 'last part of the generated username (after the @ sign).  Example: \'demo.org\' produces shane1@demo.org, shane2@demo.org',
		hasValue: true,
		required: true
	}, {
		name: 'clientid',
		char: 'i',
		description: 'connected app consumer key',
		hasValue: true,
		required: false
	}, {
		name: 'definitionfile',
		char: 'f',
		description: 'path to a scratch org definition file',
		hasValue: true,
		required: false
	}, {
		name: 'durationdays',
		char: 'd',
		description: 'duration of the scratch org (in days) (default:7, min:1, max:30)',
		hasValue: true,
		required: false
	}, {
		name: 'noancestors',
		char: 'c',
		description: 'do not include second-generation package ancestors in the scratch org',
		hasValue: false,
		required: false
	}, {
		name: 'nonamespace',
		char: 'n',
		description: 'creates the scratch org with no namespace',
		hasValue: false,
		required: false
	}, {
		name: 'setalias',
		char: 'a',
		description: 'set an alias for for the created scratch org',
		hasValue: true,
		required: false
	}, {
		name: 'setdefaultusername',
		char: 's',
		description: 'set the created org as the default username',
		hasValue: false,
		required: false
	}, {
		name: 'targetdevhubusername',
		char: 'v',
		description: 'username or alias for the dev hub org; overrides default dev hub org',
		hasValue: true,
		required: false
	}, {
		name: 'wait',
		char: 'w',
		description: 'the streaming client socket timeout (in minutes) (default:6, min:2)',
		hasValue: true,
		required: false
	}, {
		name: 'json',
		description: 'return the output as json',
		hasValue: false,
		required: false
	}, {
		name: 'loglevel',
		description: 'logging level for this command invocation (error*,trace,debug,info,warn,fatal)',
		hasValue: true,
		required: false
	}
];

const usernameURL = 'https://unique-username-generator.herokuapp.com/unique';


async function execAsync(command) {
	// console.log('command starting');
	try{
		const { stdout, stderr } = await exec(command);
		// console.log('command completed');
		if (stdout) {
			console.log(stdout);
		} else if (stderr) {
			console.error(stderr);
		}
	} catch (err){
		console.error(err);
	}
}


(function () {
	'use strict';

	module.exports = {
		topic: 'org',
		command: 'create',
		description: 'Creates an org with a friendlier unique username',
		help: 'Drop-in replacement for force:org:create but with a less ugly username',
		flags: flags,
		run(context) {

			// gets the unique username
			request({
				method: 'post',
				uri: usernameURL,
				body: {
					prefix: context.flags.userprefix,
					domain : context.flags.userdomain
				},
				json: true
			}, (error, res, username) => {
				let command = 'sfdx force:org:create';

				for (let arg of Object.keys(context.flags)){
					if (arg !== 'userprefix' && arg !== 'userdomain') {
						let foundFlags = flags.filter((flag) => flag.name === arg);
						let foundFlag = foundFlags[0];
						if (foundFlag){
							if (foundFlag.hasValue){
								// has a value
								command = `${command} --${foundFlag.name} ${context.flags[foundFlag.name]}`;
							} else { // no value
								command = `${command} --${foundFlag.name}`;
							}
						} else {
							throw (`key not found: ${arg}`);
						}
					}
				}
				command = `${command} username="${username.message}"`;

				if (!context.flags.json){
					console.log(`executing ${command}...`);
					execAsync(command);
				} else {
					execAsync(command);
				}
			});

		}
	};

}());