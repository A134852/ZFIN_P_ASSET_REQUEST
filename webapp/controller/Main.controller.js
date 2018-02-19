sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"ZFIN_P_ASSET_REQUEST/model/formatter"
], function(MessageBox, Controller, formatter) {
	"use strict";

	return Controller.extend("ZFIN_P_ASSET_REQUEST.controller.Main", {
		formatter: formatter,

		onInit: function() {
			var oModel, oView;
			oModel = this.getView().getModel();
			oView = this.getView();
			oView.setModel(oModel);
		},

		onAfterRendering: function() {
			// var oSmartTable = this.getView().byId("listTableId");
			// var rows = oSmartTable.getRows();
			// var tableId = oSmartTable.getId();

			// for (var i = 0; i < rows.length; i++) {
			// 	var index = rows[i].getIndex();
			// 	var context = this.getView().byId("listTableId").getContextByIndex(index);
			// 	if (context !== null) {
			// 		var path = context.sPath;
			// 		var obj = this.getView().byId("listTableId").getModel().getProperty(path);
			// 		var wbsStatus = obj.WBSStatus;
			// 		var wfStatus = obj.WorkflowStatus;
			// 		var rowselId = "#" + tableId + "-rowsel" + i;

			// 		if (!(wbsStatus.includes("AUC") || wbsStatus.includes("TECO")) || !(wfStatus === "INITIAL")) {
			// 			$(rowselId).attr("class", "");
			// 		} else {
			// 			$(rowselId).attr("class", "sapUiTableRowHdr");
			// 		}
			// 	}
			// }

		},

		_readDataReceived: function() {
			var oSmartTable = this.getView().byId("listTableId");
			var rows = oSmartTable.getRows();
			var tableId = oSmartTable.getId();

			for (var i = 0; i < rows.length; i++) {
				var index = rows[i].getIndex();
				var context = this.getView().byId("listTableId").getContextByIndex(index);
				var path = context.sPath;
				var obj = this.getView().byId("listTableId").getModel().getProperty(path);
				var wbsStatus = obj.WBSStatus;
				var wfStatus = obj.WorkflowStatus;
				var rowselId = "#" + tableId + "-rowsel" + i;

				if (!(wbsStatus.includes("AUC") || wbsStatus.includes("TECO")) || !(wfStatus === "INITIAL")) {
					$(rowselId).attr("class", "");
				} else {
					$(rowselId).attr("class", "sapUiTableRowHdr");
				}
			}
			//  this.getView().byId("rowsel0").setEnabled(false);
			// var oTable = this.getView().byId("listTableId");
			// var oItemNavigation = oTable.getItemNavigation();
			// var oItemRef = oItemNavigation.getItemDomRefs();

			// for (var i = 1; i < oItemRef.length; i++) {
			// 	var oDomRef = oItemRef[i].cells[0];
			// 	var oCheckBoxId = oDomRef.childNodes[0].childNodes[0].id;
			// //	var oTextMatch = oTable.getAggregation("items")[i - 1].getCells()[1].getText();
			// //	if (oTextMatch == "INITIAL") {
			// 		var oSelectBox = sap.ui.getCore().byId(oCheckBoxId);
			// 		oSelectBox.setEnabled(false);
			// //	}
			// }

		},

		onLinkPress: function(oEvent) {
			var wbsElement = oEvent.getSource().getText();
			var ObjectNum;
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZFIN_P_ASSET_REQUEST_SRV/", false);

			oModel.read("/WBSAssetRequestHeaderSet(WBSElement=" + "'" + wbsElement + "'" + ")",
				null,
				null,
				false,
				function(oData, oResponse) {
					var oODataJSONModel = new sap.ui.model.json.JSONModel();
					oODataJSONModel.setData(oData);
					ObjectNum = oData.ObjectNum;
				}
			);

			// get a handle on the global XAppNav service
			if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				oCrossAppNavigator.isIntentSupported(["FinancialAssetRequests-display"])
					.done(function(aResponses) {})
					.fail(function() {
						new sap.m.MessageToast("Provide corresponding intent to navigate");
					});

				// generate the Hash to display a employee Id
				var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
					target: {
						semanticObject: "FinancialAssetRequests",
						action: "display"
					},
					params: {
						"AssetRequestSet": ObjectNum
					}
				})) || "";

				//Generate a  URL for the second application
				var url = window.location.href.split('#')[0] + hash;

				//Navigate to second app
				sap.m.URLHelper.redirect(url, true);
			} else {
				// MessageBox.success(
				// 	wbsElement, {}
				// );
				window.open(
					"https://s4hanadev.agl.com.au:44320/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-client=200##FinancialAssetRequests-display"
				);
				jQuery.sap.log.info("Cannot Navigate - Application Running Standalone");
			}
		},

		onPress: function(evt) {
			//oSmartTable.getSelectedIndices() returns all selected rows incl. invisible ones; oSmartTable.getRows() returns only visible and selected rows.
			var oTable = this.getView().byId("SmartTableId");
			var oSmartTable = this.getView().byId("listTableId");
			var indices = oSmartTable.getSelectedIndices();
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZFIN_P_ASSET_REQUEST_SRV/", true);
			var noWfStarted = [],
				noWfStatus = [],
				WfStarted = [];
			var msg;

			for (var i = 0; i < indices.length; i++) {
				var context = this.getView().byId("listTableId").getContextByIndex(indices[i]);
				if (!(context === undefined)) {
					var path = context.sPath;
					var obj = this.getView().byId("listTableId").getModel().getProperty(path);
					var wbsElement = obj.WBSElement;
					var wbsStatus = obj.WBSStatus;
					var wfStatus = obj.WorkflowStatus;

					if (!(wfStatus === "INITIAL")) {
						noWfStarted.push(wbsElement);
					} else if (!(wbsStatus.includes("AUC") || wbsStatus.includes("TECO"))) {
						noWfStatus.push(wbsElement);
					} else {
						WfStarted.push(wbsElement);
						oModel.callFunction("/TriggerAssetRequestApproval",
							"POST", {
								"WBSElement": wbsElement
							},
							null,
							function(oData, response) {},
							function(oError) {}
						);
					}
				}
			}

			if (noWfStarted.length > 0) {
				msg = "Workflow for: " + noWfStarted + " not triggered." + "--WBS Workflow Status Not Initial.";
			}

			if (noWfStatus.length > 0) {
				if (typeof msg !== "undefined") {
					msg = msg + "\n\nWBS: " + noWfStatus + " not triggered." + "--WBS Status Not TECO OR AUC.";
				} else {
					msg = "WBS: " + noWfStatus + " not triggered." + "--WBS Status Not TECO OR AUC.";
				}
			}

			if (WfStarted.length > 0) {
				if (typeof msg !== "undefined") {
					msg = msg + "\n\nWorkflow for: " + WfStarted + " triggered";
				} else {
					msg = "Workflow for: " + WfStarted + " triggered";
				}
			}

			if (typeof msg !== "undefined") {
				if (WfStarted.length > 0) {

					MessageBox.success(
						msg, {}
					);
				} else {
					MessageBox.warning(
						msg, {}
					);
				}

			} else {
				msg = "No WBS Selected.";
				MessageBox.error(
					msg, {}
				);
			}

			if (WfStarted.length > 0) {
				oTable.rebindTable();
			}
		},

		_getSmartTable: function() {
			if (!this._oSmartTable) {
				this._oSmartTable = this.getView().byId("SmartTableId").getTable();
			}
			return this._oSmartTable;
		}
	});
});