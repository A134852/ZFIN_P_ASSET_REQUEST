sap.ui.define([], function() {
	"use strict";
	return {
		statusText: function(sStatus) {
			if (sStatus === "STARTED" || sStatus === "Pending Approval") {
				return "Success";
			} else if (sStatus === "In Progress") {
				return "Warning";
			} else if (sStatus === "Error" || sStatus === "ERROR") {
				return "Error";
			} else {
				return "None";
			}
		}
	};
});