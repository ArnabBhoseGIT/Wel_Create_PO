sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/core/mvc/Controller"
], function (Object, MessageBox, Button, Dialog, Text, Controller, mobileLibrary) {
	"use strict";
	var ButtonType = mobileLibrary.ButtonType;
	return Object.extend("wel.CreatePO.controller.ErrorMessageController", {

		handle: function (infoMessage, resourceModel, bCompact) {
			var infoLines = infoMessage;
			if (infoLines) {
				var dialogHeader = "Error";
				var dialogHeaderText = resourceModel.getResourceBundle().getText("infoMessageDialogHeaderTxt");
				this.showFormattedTextInfo(dialogHeader, dialogHeaderText, infoLines, bCompact);
			}

		},

		showFormattedTextInfo: function (dialogHeader, dialogHeaderText, infoLines, bCompact) {
			if (infoLines && infoLines.length) {
				var details = "<ul>";
				// var headerText = "<h4>" + dialogHeaderText + "</h4>";
				$.each(infoLines, function (idx, line) {
					details = details + '<li>' + line.message;
				});
				details = details + '</ul>';

				jQuery.sap.require("sap.m.Dialog");
				jQuery.sap.require("sap.m.DialogType");
				jQuery.sap.require("sap.m.MessageBox");
				jQuery.sap.require("sap.m.Button");
				var dialog = new sap.m.Dialog({
					icon: "sap-icon://message-error",
					title: dialogHeader,
					type: sap.m.DialogType.Message,
					content: new sap.ui.core.HTML().setContent(details),
					beginButton: new sap.m.Button({
						text: 'OK',
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});
				dialog.addStyleClass("sapMMessageBoxInformation");
				dialog.addStyleClass("sapUiSizeCompact");
				dialog.open();
			}
		}

	});
});