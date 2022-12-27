/* Magic Mirror
 * Node Helper: RTM
 *
 * By 
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		if (notification === "RTM-NOTIFICATION_TEST") {
			var timetables = payload[0].connections[1]["timetables"]
			// var color = payload[2].connections[1]
			// var color2 = payload[2].connections[0]

			var countKey = Object.keys(timetables).length;
			console.log(payload[0].connections)
			console.log("Working notification system. Notification:", notification, "payload: ", payload);
			// Send notification
			// console.log(color)
			// console.log(color2)
			this.sendNotificationTest(this.anotherFunction()); //Is possible send objects :)
		}
	},

	// Example function send notification test
	sendNotificationTest: function(payload) {
		this.sendSocketNotification("RTM-NOTIFICATION_TEST", payload);
	},

	// this you can create extra routes for your module
	extraRoutes: function() {
		var self = this;
		this.expressApp.get("/RTM/extra_route", function(req, res) {
			// call another function
			values = self.anotherFunction();
			res.send(values);
		});
	},

	// Test another function
	anotherFunction: function() {
		return {date: new Date()};
	}
});
