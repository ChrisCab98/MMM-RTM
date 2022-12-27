/* global Module */

/* Magic Mirror
 * Module: RTM
 *
 * By 
 * MIT Licensed.
 */

Module.register("RTM", {
	defaults: {
		updateInterval: 60000,
		retryDelay: 5000
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;

		var baseURL = 'https://hermes.rtm.fr/api/v1/mobile/station-details-by-line?pointList='

		var argumentList = ""
		for (let i = 0; i< (this.config.line).length;i++){
			argumentList+= "RTM:PNT:" + (this.config.line)[i]["pointRef"] + ","
		}

		var encodedArguments = encodeURI(argumentList)

		// var urlApi = "https://hermes.rtm.fr/api/v1/mobile/station-details-by-line?pointList=RTM%3APNT%3A00003493";
		var urlApi = baseURL + encodedArguments

		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.setRequestHeader("x-api-key", "23bc4-a57c4")
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var now = new Date()
		// var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		// If this.dataRequest is not empty
		if (this.dataRequest) {

			var upcommingLines = document.createElement("div");


			// Video Maps
			var video = document.createElement("video");

            video.src = '/modules/RTM/Maps.mov'
			video.autoplay = 'true'
			video.loop = 'true'
			video.height = "375"
			video.width = "480"


			
			var wrapperAlert = document.createElement("div")
			var wrapperParking = document.createElement("div")

			var concatLines = ""
			var formatedDatas = []

			var tmpData ={}
	

			for (let i = 0 ; i< (this.dataRequest).length;i++){
				for (let n = 0; n<(this.config.line).length;n++){
					if ('RTM:PNT:' + (this.config.line)[n]["pointRef"] === (this.dataRequest[i]["pointRef"])){

						for (let x = 0; x<(this.dataRequest[i]["connections"]).length;x++){
							concatLines+="[" + (this.dataRequest[i]["connections"][x]["linePublicCode"] + " | " + this.config.line[n]["linePublicCode"] + "]")
							
							if ((this.dataRequest[i]["connections"][x]["linePublicCode"]) === (this.config.line[n]["linePublicCode"])){
						
								concatLines+= " OK "
								
								if ((Array.from(this.dataRequest[i]["connections"][x]["linePublicCode"]))[0] === "M"){
									tmpData["icon"] = "fa-solid fa-train-subway"

								}
								else if ((Array.from(this.dataRequest[i]["connections"][x]["linePublicCode"]))[0] === "T"){
									tmpData["icon"] = "fa-solid fa-train-tram"

								}
								else{
									tmpData["icon"] = "fa-solid fa-bus-simple"
								}

								tmpData["linePublicCode"] = this.dataRequest[i]["connections"][x]["linePublicCode"]
								tmpData["lineColorValue"] = this.dataRequest[i]["connections"][x]["lineColorValue"]
								tmpData["timetables"] = this.dataRequest[i]["connections"][x]["timetables"]
								tmpData["pointName"] = this.dataRequest[i]["pointName"]


								formatedDatas.push(tmpData)
								tmpData = {}

							}
						}
						concatLines+= "<br>"
					}
				}
			}


			for (let m = 0; m < formatedDatas.length; m++){
				let tmpLine = document.createElement("div")
				let depart = "<ul class = 'list'> "
				let text = ""

				if ((formatedDatas[m]["timetables"]).length == 0){
					depart += "<li class = 'item' > Aucun horaire temps réel n'est disponible </li>"
				}
				else {
					for (let y = 0; y < formatedDatas[m]["timetables"].length; y++){
						var HHMM = formatedDatas[m]["timetables"][y]["departureTime"].split(":")
						var next = new Date()
						next.setHours(parseInt(HHMM[0]))
						next.setMinutes(parseInt(HHMM[1]))

						var nextDeparture = Math.round((next-now)/60000)

						if (nextDeparture <= 0 ){
							depart+= " <li class = 'item'> En vue </li>"
						}
						else {
							depart += "<li class = 'item'> " +nextDeparture + "min </li> "
						}

					}
				}
				depart+= "</ul>"
				text += "<i class='" + formatedDatas[m]["icon"] + "' style='color:#"+formatedDatas[m]["lineColorValue"]+"'></i> | " + formatedDatas[m]["linePublicCode"] + " : " + formatedDatas[m]["pointName"]
				text += "<br> Prochains départs : <br>" + depart

				tmpLine.innerHTML = text
				
				upcommingLines.appendChild(tmpLine)
			}


			wrapperAlert.className = "alert alert-warning"
			wrapperParking.className = "alert alert-info"

			wrapperParking.innerHTML = "<i class='fa-solid fa-square-parking'></i> | La Fourragère :<br>31 Places disponibles" 

			wrapperAlert.innerHTML = "Depuis le 27 juin :<br> Réseaux Bus-Métro-Tram : passage en horaires vacances"
			

			var labelDataRequest = document.createElement("label");
			// Use translate function
			// this id defined in translations files
			labelDataRequest.innerHTML = "<h2>" + this.translate("TITLE") + "<h2/>";
		
			wrapper.appendChild(upcommingLines)
			// wrapper.appendChild(video)


		}

		// Data from helper
		if (this.dataNotification) {
			var wrapperDataNotification = document.createElement("div");
			// translations  + datanotification
			wrapperDataNotification.innerHTML =  this.translate("UPDATE") + ": " + this.dataNotification.date;
		}
		return wrapper;
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"RTM.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	getHeader: function () {
		return "<h2> La métropole mobilité <h2/>";
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("RTM-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "RTM-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},
});
