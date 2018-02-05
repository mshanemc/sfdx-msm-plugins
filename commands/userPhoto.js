const forceUtils = require('../lib/forceUtils');
const fs = require('fs-extra-promisify');


const uploadToDocId = (conn, localPath, title) => {
	return new Promise((resolve, reject) => {
		fs.readFile(localPath)
			.then((filedata) => {
				let base64data = filedata.toString('base64');
				return conn.sobject('ContentVersion').create({
					VersionData: base64data,
					PathOnClient: localPath,
					Title: title //context.flags.firstName + context.flags.lastName + 'ChatterPhoto'
				});
			})
			.then((uploadedFile) => {
				console.log(`Uploaded ${localPath} to ContentVersion ${uploadedFile.id}`);
				return conn.query(`Select Id, ContentDocumentId from ContentVersion where Id='${uploadedFile.id}'`);
			})
			.then((queryResult)=>{
				if (queryResult.records[0].ContentDocumentId){
					resolve(queryResult.records[0].ContentDocumentId);
				} else {
					reject(queryResult);
				}
			});
	});
};

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
				name: 'banner',
				char: 'b',
				description: 'local path of the chatter banner photo to use',
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

					let query;
					if (context.flags.firstName){
						query = `Select Id from User where LastName = '${context.flags.lastName}' and FirstName = '${context.flags.firstName}'`;
					} else {
						query = `Select Id from User where LastName = '${context.flags.lastName}'`;
					}
					//first, query the user
					conn.query(query)
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
						if (context.flags.file){
							//do the chatter file thing
							// const uploadToDocId = (conn, localPath, title) => {
							uploadToDocId(conn, context.flags.file, context.flags.firstName + context.flags.lastName + 'ChatterPhoto')
								.then((ContentDocumentId) => {
									return conn.chatter.resource(`/connect/user-profiles/${userid}/photo`).update({ fileId: ContentDocumentId });
								})
								.then(() => {
									if (context.flags.firstName) {
										return console.log(`Successfully set chatter photo for user ${userid} (${context.flags.firstName} ${context.flags.lastName})`);
									} else {
										return console.log(`Successfully set chatter photo for user ${userid} (${context.flags.lastName})`);
									}
								});
						}
					})
					.then(() => {
						if (context.flags.banner) {
							//do the chatter file thing
							// const uploadToDocId = (conn, localPath, title) => {
							uploadToDocId(conn, context.flags.banner, context.flags.firstName + context.flags.lastName + 'ChatterBanner')
								.then((ContentDocumentId) => {
									return conn.chatter.resource(`/connect/user-profiles/${userid}/banner-photo`).update({ fileId: ContentDocumentId });
								})
								.then(() => {
									if (context.flags.firstName) {
										return console.log(`Successfully set chatter banner for user ${userid} (${context.flags.firstName} ${context.flags.lastName})`);
									} else {
										return console.log(`Successfully set chatter banner for user ${userid} (${context.flags.lastName})`);
									}
								});
						}
					})
					.catch((err) => {
						console.log(`Error: ${err}`);
					});

				});
			});

		}
	};
}());

