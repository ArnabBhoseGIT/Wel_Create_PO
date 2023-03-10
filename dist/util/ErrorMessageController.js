sap.ui.define(["sap/ui/base/Object","sap/m/MessageBox","sap/m/Button","sap/m/Dialog","sap/m/Text","sap/m/library","sap/ui/core/mvc/Controller"],function(e,a,s,t,o,r,n){"use strict";var i=n.ButtonType;return e.extend("wel.CreatePO.controller.ErrorMessageController",{handle:function(e,a,s){var t=e;if(t){var o="Error";var r=a.getResourceBundle().getText("infoMessageDialogHeaderTxt");this.showFormattedTextInfo(o,r,t,s)}},showFormattedTextInfo:function(e,a,s,t){if(s&&s.length){var o="<ul>";$.each(s,function(e,a){o=o+"<li>"+a.message});o=o+"</ul>";jQuery.sap.require("sap.m.Dialog");jQuery.sap.require("sap.m.DialogType");jQuery.sap.require("sap.m.MessageBox");jQuery.sap.require("sap.m.Button");var r=new sap.m.Dialog({icon:"sap-icon://message-error",title:e,type:sap.m.DialogType.Message,content:(new sap.ui.core.HTML).setContent(o),beginButton:new sap.m.Button({text:"OK",press:function(){r.close()}}),afterClose:function(){r.destroy()}});r.addStyleClass("sapMMessageBoxInformation");r.addStyleClass("sapUiSizeCompact");r.open()}}})});