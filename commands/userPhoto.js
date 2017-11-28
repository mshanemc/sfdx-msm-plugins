const forceUtils = require('../lib/forceUtils');
const fs = require('fs-extra-promisify');

(function () {
	'use strict';

	module.exports = {
		topic: 'user',
		command: 'photo',
		description: 'Set the photo for a user by first/last name',
		help: 'Uploads a local file and saves that as the chatter photo for a user, given their First and Last name (since username is randomly generated)',
    flags: [{
      name: 'firstName',
      char: 'g',
      description: 'first (given) name of the user--keeping -f for file for consistency',
      hasValue: true,
      required: false
    }, {
      name: 'lastName',
      char: 'l',
      description: 'last name of the user',
      hasValue: true,
      required: true
			}, {
				name: 'file',
				char: 'f',
				description: 'local path of the photo to use',
				hasValue: true,
				required: false
			}, {
				name: 'targetusername',
				char: 'u',
				description: 'username for the target org',
				hasValue: true,
				required: false
			}],
		run(context) {
			let targetUsername = context.flags.targetusername;
			let userid;

			forceUtils.getOrg(targetUsername, (org) => {
				org.force._getConnection(org, org.config).then((conn) => {
					targetUsername = org.authConfig.username;

					//first, query the user
					conn.query(`Select Id from User where FirstName = '${context.flags.firstName}' and LastName = '${context.flags.lastName}'`)
					.then( (result) => {
						if (result.totalSize > 1) {
							return console.log('There are more than 1 result for that name.');
						} else if (result.totalSize === 0) {
							return console.log('User not found');
						} else {
							userid = result.records[0].Id;
							return userid;
							//return result.records[0].Id;
						}
					})
					.then( () => {
						return fs.readFile(context.flags.file);
					})
					.then( (filedata)=>{
						//console.log(filedata);
						let base64data = filedata.toString('base64');
						return conn.sobject('ContentVersion').create({
							VersionData: base64data,
							PathOnClient: context.flags.file,
							Title: context.flags.firstName + context.flags.lastName + 'ChatterPhoto'
						});
					})
					.then( (uploadedFile)=>{
						console.log(`Uploaded ${context.flags.file} to ContentVersion ${uploadedFile.id}`);
						return conn.query(`Select Id, ContentDocumentId from ContentVersion where Id='${uploadedFile.id}'`);
					})
					.then((CVresults)=>{
						return conn.chatter.resource(`/connect/user-profiles/${userid}/photo`).update({fileId: CVresults.records[0].ContentDocumentId});
					})
					.then(() => {
						console.log(`Successfully set chatter photo for user ${userid} (${context.flags.firstName} ${context.flags.lastName})`);
					})
					.catch((err) => {
						console.log(`Error: ${err}`);
					});

				});
			});

		}
	};
}());