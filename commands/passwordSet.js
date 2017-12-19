const forceUtils = require('../lib/forceUtils');
const rp = require('request-promise-native');

(function () {
	'use strict';

	module.exports = {
		topic: 'user',
		command: 'password:set',
		description: 'Set the password for a user by first/last name',
		help: 'Sets the password that you decide for a user, given their First and Last name (since username is randomly generated).  Can be used as a substitute for force:use:password:generate, which generates random, complex passwords',
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
			name: 'password',
			char: 'p',
			description: 'the password you want to change this user to',
			hasValue: true,
			required: true
		}, {
			name: 'targetusername',
			char: 'u',
			description: 'username for the target org (no the user that you want to set the password for, but to tell sfdx which org)',
			hasValue: true,
			required: false
		},{
			name: 'json',
			description: 'return the output as json',
			hasValue: false,
			required: false
		}],
		run(context) {
			let targetUsername = context.flags.targetusername;
			let userid;
			let user;

			forceUtils.getOrg(targetUsername, (org) => {
				org.force._getConnection(org, org.config).then((conn) => {
					targetUsername = org.authConfig.username;

					let query;
					if (context.flags.firstName) {
						query = `Select Id, Username from User where LastName = '${context.flags.lastName}' and FirstName = '${context.flags.firstName}'`;
					} else {
						query = `Select Id, Username from User where LastName = '${context.flags.lastName}'`;
					}
					//first, query the user
					conn.query(query)
						.then((result) => {
							if (result.totalSize > 1) {
								throw 'There are more than 1 result for that name.';
							} else if (result.totalSize === 0) {
								throw 'User not found';
							} else {
								userid = result.records[0].Id;
								user = result.records[0];
								return userid;
								//return result.records[0].Id;
							}
						})
						.then(() => {
							// endpoint curl https://yourInstance.salesforce.com/services/data/v25.0/sobjects/User/005D0000001KyEIIA0/password -H "Authorization: Bearer token" —H "Content-Type: application/json" —d @newpwd.json —X POST
							return rp({
								method: 'post',
								uri: `${org.authConfig.instanceUrl}/services/data/v41.0/sobjects/User/${userid}/password`,
								body: {
									NewPassword : context.flags.password
								},
								headers: {
									'Authorization': `Bearer ${org.authConfig.accessToken}`
								},
								json: true,
								resolveWithFullResponse: true
							});
						})
						.then( (resp) => {
							if (resp.statusCode === 204){
								if (context.flags.json){
									let output = {
										status: 0,
										result: {
											password: context.flags.password
										}
									};
									console.log(JSON.stringify(output));
								} else {
									console.log(`Successfully set the password "${context.flags.password}" for user ${ user.Username }.`);
									console.log(`You can see the password again by running "sfdx force:user:display -u ${user.Username }".`);
								}
							} else {
								console.error(resp);
							}
						})
						.catch((err) => {
							if (context.flags.json) {
								let output = {
									status: 1,
									message: err
								};
								console.error(JSON.stringify(output));
							} else {
								console.error(`Error: ${err}`);
							}
						});

				});
			});

		}
	};
}());