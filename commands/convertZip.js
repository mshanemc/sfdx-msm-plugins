const { execSync } = require('child_process');
const fs = require('fs');

const tmpPkg = 'tmpPkg';

(function () {
	'use strict';

	module.exports = {
		topic: 'source',
		command: 'zip',
		description: 'converts source and zips it for you',
		help: 'takes sfdx source, does convert, and stores the result in a zip file',
		flags: [
			{
				name: 'rootdir',
				char: 'r',
				description: 'the source directory for the source to be converted.',
				hasValue: true,
				required: true
			},
			{
				name: 'outputFile',
				char: 'd',
				description: 'the output zip file. Defaults to mdapi.zip',
				hasValue: true,
				required: false
			}
		],
		run(context) {
			//default flags
			context.flags.outputFile = context.flags.outputFile || 'mdapi.zip';
			// make our local directory if needed
			if (!fs.existsSync(tmpPkg)){
				fs.mkdirSync(tmpPkg);
			}


			//convert it
			execSync(`sfdx force:source:convert -d ${tmpPkg} -r ${context.flags.rootdir}`);
			// zip
			execSync(`zip -r ${context.flags.outputFile} ${tmpPkg}`);
			// cleanup after yourself
			execSync(`rm -rf ./${tmpPkg}`);
		}
	};
}());