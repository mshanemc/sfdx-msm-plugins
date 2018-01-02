const { execSync } = require('child_process');
const fs = require('fs');

const tmpDir = 'mdapiout';
const tmpPkg = 'tmpPkg';
const packageXMLs = require('../lib/packageXMLs.js');

function errorHandler(result, successMessage) {
	//console.log(result.stderr);
	console.log(successMessage);
}

(function () {
	'use strict';

	module.exports = {
		topic: 'mdapi',
		command: 'pull',
		description: 'gets unpackaged metadata for you',
		help: 'You have a non-scratch org and want to get source code from it',
		flags: [
			{
				name: 'code',
				char: 'c',
				description: 'Pull apex, VF, Lightning Components, triggers, static resources',
				hasValue: false,
				required: false
			},
			{
				name: 'all',
				char: 'a',
				description: 'Pulls just about everything',
				hasValue: false,
				required: false
			},
			{
				name: 'sourceOrg',
				char: 'u',
				description: 'username/alias of org where the package is',
				hasValue: true,
				required: true
			},
			{
				name: 'destination',
				char: 'd',
				description: 'where to put the pulled source.  Default is force-app',
				hasValue: true,
				required: false
			}
		],
		run(context) {
			const dest = context.flags.destination || './force-app';

			if (!fs.existsSync(tmpPkg)){
				fs.mkdirSync(tmpPkg);
			}

			if (context.flags.code){
				fs.writeFileSync(`${tmpPkg}/package.xml`, packageXMLs.getCode());
			} else if (context.flags.all) {
				fs.writeFileSync(`${tmpPkg}/package.xml`, packageXMLs.getAll());
			} else {
				result = execSync(`rm -rf ./${tmpPkg}`);
				throw 'you have to specify either -c or -a'
			}

			let result = execSync(`sfdx force:mdapi:retrieve -s -k ${tmpPkg}/package.xml -u ${context.flags.sourceOrg}  -r ./${tmpDir} -w 30`);
			errorHandler(result, 'Code Retrieved.  Unzipping...');

			result = execSync(`unzip -o ./${tmpDir}/unpackaged.zip -d ./${tmpDir}`);
			errorHandler(result, 'Code Unzipped.  Converting...');

			result = execSync(`sfdx force:mdapi:convert -r ./${tmpDir} -d ${dest}`);
			errorHandler(result, 'Code Converted.  Cleaning up...');

			result = execSync(`rm -rf ./${tmpPkg}`);
			result = execSync(`rm -rf ./${tmpDir}`);
			errorHandler(result, 'Done!');


		}
	};


}());