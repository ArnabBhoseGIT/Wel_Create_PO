sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/core/Core',
	'sap/ui/core/message/Message',
	'sap/ui/core/library',
	"sap/m/MessageBox",
	'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/Token',
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"wel/CreatePO/util/ErrorMessageController",
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Core, Message, coreLibrary, MessageBox, ColumnListItem, Label,
	Token, Fragment, MessageToast, ErrorMessageController) {
	"use strict";
	var userName = "";
	var copiedPersonalSettingsItems = "";
	var copiedPersonalSettingsItems2 = "";
	var copiedHeaderText = "";
	var copiedHeaderText2 = "";
	var checkPartner = [];
	var itemCount = 0;
	var currencyDependingOnVendor = [];
	return BaseController.extend("wel.CreatePO.controller.Worklist", {

		formatter: formatter,
		onInit: function () {
			var oModel = new sap.ui.model.json.JSONModel(sap.ui.Device);
			this.setModel(oModel, "device");
			var oView = this.getView();
			if (!sap.ui.Device.system.desktop) {
				oView.byId("idFirstVBox").addStyleClass("vboxAlignment2");
			}
			setTimeout(function () {
				$(".dateInputHide").find("input").attr("readonly", true);
			}, 200);
			itemCount = 0;
			this.getRouter().getRoute("worklist").attachPatternMatched(this.callModels, this);

		},
		callModels: function () {
			//Models call related to Personal Settings.//
			// setTimeout(function () {
			// 	$(".dateInputHide").find("input").attr("readonly", true);
			// }, 200);
			var _self = this;
			var today = this.formattingDate(new Date());
			this.getView().byId("idDocDate").setValue(today);
			this.getOwnerComponent().getModel().read("/UserNameSet", {
				success: function (data, response) {
					userName = data.results[0].Uname;
				},
				error: function () {}
			});
			this.getOwnerComponent().getModel().read("/VendorListSet", {
				success: function (data, response) {
					var VendorListModel = new JSONModel(data);
					_self.setModel(VendorListModel, "VendorListModelName");
				},
				error: function () {}
			});
			this.getOwnerComponent().getModel().read("/PurchasingOrgsSet", {
				success: function (data, response) {
					for (var poLcv = 0; poLcv < data.results.length; poLcv++) {
						data.results[poLcv].Ekotx = data.results[poLcv].Ekotx + " " + "(" + data.results[poLcv].Ekorg + ")";
					}
					var PurchasingOrgsModel = new JSONModel(data);
					PurchasingOrgsModel.setSizeLimit(1000);
					_self.setModel(PurchasingOrgsModel, "PurchasingOrgsSetName");
				},
				error: function () {}
			});
			this.getOwnerComponent().getModel().read("/PurchasingGrpsSet", {
				success: function (data, response) {
					var PurchasingGrpsModel = new JSONModel(data);
					PurchasingGrpsModel.setSizeLimit(1000);
					for (var pgLcv = 0; pgLcv < data.results.length; pgLcv++) {
						data.results[pgLcv].Eknam = data.results[pgLcv].Eknam + " " + "(" + data.results[pgLcv].Ekgrp + ")";
					}
					_self.setModel(PurchasingGrpsModel, "PurchasingGrpsSetName");
				},
				error: function () {}
			});
			this.getOwnerComponent().getModel().read("/VendorCurrencySet", {
				success: function (data, response) {
					var VendorCurrencyModel = new JSONModel(data);
					VendorCurrencyModel.setSizeLimit(1000);
					for (var vcLcv = 0; vcLcv < data.results.length; vcLcv++) {
						data.results[vcLcv].Ltext = data.results[vcLcv].Ltext + " " + "(" + data.results[vcLcv].Wears + ")";
					}
					_self.setModel(VendorCurrencyModel, "VendorCurrencySetName");
				},
				error: function () {}
			});
			this.getOwnerComponent().getModel().read("/CompanyCodesSet", {
				success: function (data, response) {
					var CompanyCodesModel = new JSONModel(data);
					CompanyCodesModel.setSizeLimit(1000);
					for (var ccsLcv = 0; ccsLcv < data.results.length; ccsLcv++) {
						data.results[ccsLcv].Butxt = data.results[ccsLcv].Butxt + " " + "(" + data.results[ccsLcv].Bukrs + ")";
					}
					_self.setModel(CompanyCodesModel, "CompanyCodesSetName");
				},
				error: function () {}
			});
			this.getOwnerComponent().getModel().read("/PersonalSettingsSet", {
				success: function (data, response) {
					copiedPersonalSettingsItems = jQuery.extend(true, {}, data);
				},
				error: function (response) {}
			});
		},
		onValueHelpRequest: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var resourceBundle = this.getResourceBundle();
			this.selectVendorDialog = new sap.m.SelectDialog({
				title: resourceBundle.getText("slctVndr"),
				items: {
					path: "/VendorListSet",
					template: new sap.m.StandardListItem({
						title: "{Name1}",
						description: "{Lifnr}"
					})
				},
				liveChange: [
					this.onVendorSearch, this
				],
				confirm: [this.onVendorSelection,
					this
				],
				cancel: [this.onVendorDialogClose,
					this
				]
			});
			this.selectVendorDialog.setModel(oModel);
			this.selectVendorDialog.open();
		},
		onVendorSearch: function (oEvent) {
			var oFilter = "";
			var sQuery = oEvent.getParameter("value");
			if (sQuery && sQuery.length > 2) {
				oFilter = new Filter({
					filters: [
						new Filter({
							path: 'Lifnr',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						})
						// new Filter({
						// 	path: 'Name1',
						// 	operator: sap.ui.model.FilterOperator.Contains,
						// 	value1: sQuery
						// })
					],
					and: true
				});
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(oFilter);
		},
		onVendorSelection: function (oEvent) {
			var oInput = this.byId("idVendor");
			var oResourceBundle = this.getResourceBundle();
			var aContexts = "";
			var _that = this;
			var selectedVendorId = "";
			// var currency = "";
			if (oEvent.getParameter("selectedItem") && oEvent.getId() !== "suggestionItemSelected") {
				var oSelectedItem = oEvent.getParameter("selectedItem").getDescription();
				aContexts = oEvent.getParameter("selectedContexts");
				aContexts.map(function (oContext) {
					selectedVendorId = oContext.getObject().Lifnr;
					// currency = oContext.getObject().Waers;
				});
			} else if (oEvent.getId() === "suggestionItemSelected") {
				selectedVendorId = oEvent.getParameter("selectedItem").getProperty("text").split("(")[1].split(")")[0];
			} else {
				selectedVendorId = oEvent.getSource().getProperty("value");
			}
			var filterByVendorId = new sap.ui.model.Filter({
				path: "Lifnr", // string
				operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
				value1: selectedVendorId // object
			});
			this.getOwnerComponent().getModel().read("/VendorListSet", {
				urlParameters: {
					$expand: "VendorPartnerNav"
				},
				filters: [filterByVendorId],
				success: function (data, response) {
					if (data.results.length) {
						var vendorPartnerModel = new JSONModel(data.results[0].VendorPartnerNav);
						if (!((data.results[0].VendorPartnerNav.results).length)) {
							MessageBox.alert(oResourceBundle.getText("noPrtnrAvlbl") + " " + "(" + selectedVendorId + ")");
						} else {
							checkPartner = [];
							for (var pcLcv = 0; pcLcv < (data.results[0].VendorPartnerNav.results).length; pcLcv++) {
								checkPartner.push(data.results[0].VendorPartnerNav.results[pcLcv]);
							}
						}
						_that.getView().byId("idVendor").setValue(data.results[0].Name1 + " " + "(" + data.results[0].Lifnr + ")");
						var poNetValueWithCurrency = (parseFloat(_that.getView().byId("idPoNetValue").getText())).toFixed(2) + " " + data.results[0].Waers;
						if (parseFloat(poNetValueWithCurrency)) {
							poNetValueWithCurrency = poNetValueWithCurrency;
						} else {
							poNetValueWithCurrency = "0.00" + " " + data.results[0].Waers;
						}
						currencyDependingOnVendor = [];
						currencyDependingOnVendor.push(data.results[0].Waers);
						_that.getView().byId("idPoNetValue").setText(poNetValueWithCurrency);

						// if (oEvent.getSource().getId() === "idCurrency") {
						if (_that.getView().byId("idItemsTable").getItems()) {
							for (var dcLcv = 0; dcLcv < _that.getView().byId("idItemsTable").getItems().length; dcLcv++) {
								var price = _that.getView().byId("idItemsTable").getItems()[dcLcv].mAggregations.cells[6].getText().split(" ")[0];
								var currPrice = price + " " + data.results[0].Waers;
								_that.getView().byId("idItemsTable").getItems()[dcLcv].mAggregations.cells[6].setText(currPrice);
							}

						}
						// }

						_that.setModel(vendorPartnerModel, "vendorPartnerModelName");
						_that.getView().byId("idVendor").setValueState("None");
					} else {
						if (!oInput.getValue()) {
							MessageBox.alert(oResourceBundle.getText("noVndrAvlbl") + " " + "(" + selectedVendorId + ")");
							var vendorPartnerModel2 = new JSONModel([]);
							_that.setModel(vendorPartnerModel2, "vendorPartnerModelName");
							_that.getView().byId("idVendor").setValueState("Error");
						}

					}
				},
				error: function (response) {
					MessageBox.alert(oResourceBundle.getText("noVndrAvlbl") + " " + "(" + selectedVendorId + ")");
					var vendorPartnerModell = new JSONModel([]);
					_that.setModel(vendorPartnerModell, "vendorPartnerModelName");
					_that.getView().byId("idVendor").setValueState("Error");
				}
			});
			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},
		vndrLiveChange: function (oEvent) {
			var _that = this;
			this.getView().byId("idVendor").setValueState("None");
			var resourceBundle = this.getResourceBundle();
			var sQuery = "";
			sQuery = oEvent.getSource().getValue();
			if (sQuery.length > 2) {
				var oFilter = new Filter({
					filters: [
						new Filter({
							path: 'Lifnr',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						}),
						new Filter({
							path: 'Name1',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						})
					],
					and: true
				});
				this.getOwnerComponent().getModel().read("/VendorListSet", {
					urlParameters: {
						$expand: "VendorPartnerNav"
					},
					filters: [oFilter],
					success: function (data, response) {
						if (data.results.length) {
							var vndrModel = new JSONModel(data);
							_that.setModel(vndrModel, "vndrModelName");
							_that.getView().byId("idVendor").setValueState("None");
						} else {
							var vndrModel2 = new JSONModel(data);
							_that.setModel(vndrModel2, "vndrModelName");
						}
					},
					error: function (response) {
						var vndrModel = new JSONModel([]);
						_that.setModel(vndrModel, "vndrModelName");
					}
				});
			}
		},
		suggestionVendorItemSelected: function (oEvent) {
			this.getView().byId("idVendor").setValueState("None");
			this.onVendorSelection(oEvent);
		},
		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oInput.setSelectedKey(aTokens[0].getKey());
			this._oValueHelpDialog.close();
		},
		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},
		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
		},
		ounValueHelpRequest: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var resourceBundle = this.getResourceBundle();
			this.selectVendorDialog = new sap.m.SelectDialog({
				title: resourceBundle.getText("ordrUnit"),
				growing: false,
				items: {
					path: "/OrderUnitOfMeasureSet",
					template: new sap.m.StandardListItem({
						title: "{Msehl}",
						description: "{Msehi}"
					})
				},
				search: [
					this.onOunSearch, this
				],
				confirm: [this.ounSubmit,
					this
				],
				cancel: [this.onVendorDialogClose,
					this
				]
			});
			this.selectVendorDialog.setModel(oModel);
			this.selectVendorDialog.open();
		},
		onOunSearch: function (oEvent) {
			var oFilter = "";
			var sQuery = oEvent.getParameter("value");
			if (sQuery && sQuery.length > 0) {
				oFilter = new Filter({
					filters: [
						new Filter({
							path: 'Msehi',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						}),
						new Filter({
							path: 'Msehl',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						})
					],
					and: true
				});
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(oFilter);
		},
		ounSubmit: function (oEvent) {
			var oInput = this.byId("idOun");
			var resourceBundle = this.getResourceBundle();
			var aContexts = "";
			var _that = this;
			var selectedOun = "";
			var selectedOunText = "";
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getDescription();
				aContexts = oEvent.getParameter("selectedContexts");
				aContexts.map(function (oContext) {
					selectedOun = oContext.getObject().Msehi;
					selectedOunText = oContext.getObject().Msehl;
				});
				oInput.setValueState("None");
				oInput.setValue(selectedOunText + " " + "(" + selectedOun + ")");
			} else {
				selectedOun = oEvent.getSource().getProperty("value");
				var filterByMsehi = new sap.ui.model.Filter({
					path: "Msehi", // string
					operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
					value1: selectedOun // object
				});
				this.getOwnerComponent().getModel().read("/OrderUnitOfMeasureSet", {
					filters: [filterByMsehi],
					success: function (data, response) {
						if (!(data.results.length)) {
							MessageBox.alert(resourceBundle.getText("noOUNMavailableFor") + " " + "(" + selectedOun + ")");
							oInput.setValueState("Error");
						} else {
							oInput.setValueState("None");
							_that.getView().byId("idOun").setValue(data.results[0].Msehl + " " + "(" + data.results[0].Msehi + ")");
						}
					},
					error: function (response) {
						MessageBox.alert(resourceBundle.getText("noOUNMavailableFor") + " " + "(" + selectedOun + ")");
						oInput.setValueState("Error");
					}
				});
			}
			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},
		mtrlGrpValueHelpRequest: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var resourceBundle = this.getResourceBundle();
			this.selectVendorDialog = new sap.m.SelectDialog({
				title: resourceBundle.getText("mtrlGrp"),
				items: {
					path: "/MaterialGroupSet",
					template: new sap.m.StandardListItem({
						title: "{Wgbez}",
						description: "{Matkl}"
					})
				},
				search: [
					this.mtrlGrpSearch, this
				],
				confirm: [this.mtrlGrpSelection,
					this
				],
				cancel: [this.onVendorDialogClose,
					this
				]
			});
			this.selectVendorDialog.setModel(oModel);
			this.selectVendorDialog.open();
		},
		mtrlGrpSearch: function (oEvent) {
			var oFilter = "";
			var sQuery = oEvent.getParameter("value");
			if (sQuery && sQuery.length > 0) {
				oFilter = new Filter({
					filters: [
						new Filter({
							path: 'Matkl',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						}),
						new Filter({
							path: 'Wgbez',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						})
					],
					and: true
				});
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(oFilter);
		},
		mtrlGrpSelection: function (oEvent) {
			var oInput = this.byId("idMtrlGrp");
			var oInput2 = this.byId("idGlAcc");
			var oResourceBundle = this.getResourceBundle();
			var aContexts = "";
			var _that = this;
			var selectedMaterialGroup = "";
			var selectedMaterialGroupName = "";
			var selectedGLAcc = "";
			var selectedGLAccDesc = "";
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getDescription();
				aContexts = oEvent.getParameter("selectedContexts");
				aContexts.map(function (oContext) {
					selectedMaterialGroup = oContext.getObject().Matkl;
					selectedMaterialGroupName = oContext.getObject().Wgbez;
					selectedGLAcc = oContext.getObject().Sakto;
					selectedGLAccDesc = oContext.getObject().Txt50;
				});
				oInput.setValueState("None");
				oInput.setValue(selectedMaterialGroupName + " " + "(" + selectedMaterialGroup + ")");
				oInput2.setValueState("None");
				oInput2.setValue(selectedGLAccDesc + " " + "(" + selectedGLAcc + ")");
			} else {
				selectedMaterialGroup = oEvent.getSource().getProperty("value");
				var filterMatkl = new sap.ui.model.Filter({
					path: "Matkl", // string
					operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
					value1: selectedMaterialGroup // object
				});
				this.getOwnerComponent().getModel().read("/MaterialGroupSet", {
					filters: [filterMatkl],
					success: function (data, response) {
						if (!(data.results.length)) {
							MessageBox.alert(oResourceBundle.getText("noMtrlGrpAvlble") + " " + "(" + selectedMaterialGroup + ")");
							oInput.setValueState("Error");
						} else {
							oInput.setValueState("None");
							_that.getView().byId("idMtrlGrp").setValue(data.results[0].Wgbez + " " + "(" + data.results[0].Matkl + ")");
							oInput2.setValueState("None");
							_that.getView().byId("idGlAcc").setValue(data.results[0].Txt50 + " " + "(" + data.results[0].Sakto + ")");
						}
					},
					error: function (response) {
						MessageBox.alert(oResourceBundle.getText("noMtrlGrpAvlble") + " " + "(" + selectedMaterialGroup + ")");
						oInput.setValueState("Error");
					}
				});
			}
			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},
		glAccValueHelpRequest: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var resourceBundle = this.getResourceBundle();
			this.selectVendorDialog = new sap.m.SelectDialog({
				title: resourceBundle.getText("glAccnt"),
				growing: false,
				items: {
					path: "/GLAccountSet",
					template: new sap.m.StandardListItem({
						title: "{Txt50}",
						description: "{Sakto}"
					})
				},
				search: [
					this.glAccSearch, this
				],
				confirm: [this.glAccSubmit,
					this
				],
				cancel: [this.onVendorDialogClose,
					this
				]
			});
			this.selectVendorDialog.setModel(oModel);
			this.selectVendorDialog.open();
		},
		glAccSearch: function (oEvent) {
			var oFilter = "";
			var sQuery = oEvent.getParameter("value");
			if (sQuery && sQuery.length > 0) {
				oFilter = new Filter({
					filters: [
						new Filter({
							path: 'Sakto',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						}),
						new Filter({
							path: 'Txt50',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						})
					],
					and: true
				});
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(oFilter);
		},
		glAccSubmit: function (oEvent) {
			var oInput = this.byId("idGlAcc");
			var oResourceBundle = this.getResourceBundle();
			var aContexts = "";
			var _that = this;
			var selectedGlAcc = "";
			var selectedGlAccText = "";
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getDescription();
				aContexts = oEvent.getParameter("selectedContexts");
				aContexts.map(function (oContext) {
					selectedGlAcc = oContext.getObject().Sakto;
					selectedGlAccText = oContext.getObject().Txt50;
				});
				oInput.setValueState("None");
				oInput.setValue(selectedGlAccText + " " + "(" + selectedGlAcc + ")");
			} else {
				selectedGlAcc = oEvent.getSource().getProperty("value");
				var filterByVendorId = new sap.ui.model.Filter({
					path: "Sakto", // string
					operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
					value1: selectedGlAcc // object
				});
				this.getOwnerComponent().getModel().read("/GLAccountSet", {
					filters: [filterByVendorId],
					success: function (data, response) {
						if (!(data.results.length)) {
							MessageBox.alert(oResourceBundle.getText("noGlAccAvlble") + " " + "(" + selectedGlAcc + ")");
							oInput.setValueState("Error");
						} else {
							oInput.setValueState("None");
							_that.getView().byId("idGlAcc").setValue(data.results[0].Txt50 + " " + "(" + data.results[0].Sakto + ")");
						}
					},
					error: function (response) {
						MessageBox.alert(oResourceBundle.getText("noGlAccAvlble") + " " + "(" + selectedGlAcc + ")");
						oInput.setValueState("Error");
					}
				});
			}
			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},
		cstCntreValueHelpRequest: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var resourceBundle = this.getResourceBundle();
			this.selectVendorDialog = new sap.m.SelectDialog({
				title: resourceBundle.getText("cstCntr"),
				items: {
					path: "/CostCenterSet",
					template: new sap.m.StandardListItem({
						title: "{Ltext}",
						description: "{Kostl}"
					})
				},
				search: [
					this.cstCntreSearch, this
				],
				confirm: [this.cstCntreSubmit,
					this
				],
				cancel: [this.onVendorDialogClose,
					this
				]
			});
			this.selectVendorDialog.setModel(oModel);
			this.selectVendorDialog.open();
		},
		cstCntreSearch: function (oEvent) {
			var oFilter = "";
			var sQuery = oEvent.getParameter("value");
			if (sQuery && sQuery.length > 0) {
				oFilter = new Filter({
					filters: [
						new Filter({
							path: 'Kostl',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						}),
						new Filter({
							path: 'Ltext',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						})
					],
					and: true
				});
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(oFilter);
		},
		cstCntreSubmit: function (oEvent) {
			var oInput = this.byId("idCstCntre");
			var oResourceBundle = this.getResourceBundle();
			var aContexts = "";
			var _that = this;
			var selectedCostCenter = "";
			var selectedCostCenterText = "";
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getDescription();
				aContexts = oEvent.getParameter("selectedContexts");
				aContexts.map(function (oContext) {
					selectedCostCenter = oContext.getObject().Kostl;
					selectedCostCenterText = oContext.getObject().Ltext;
				});
				oInput.setValueState("None");
				oInput.setValue(selectedCostCenterText + " " + "(" + selectedCostCenter + ")");
			} else {
				selectedCostCenter = oEvent.getSource().getProperty("value");
				var filterByKostl = new sap.ui.model.Filter({
					path: "Kostl", // string
					operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
					value1: selectedCostCenter // object
				});
				this.getOwnerComponent().getModel().read("/CostCenterSet", {
					filters: [filterByKostl],
					success: function (data, response) {
						if (!(data.results.length)) {
							MessageBox.alert(oResourceBundle.getText("noCstCntreAvlbl") + " " + "(" + selectedCostCenter + ")");
							oInput.setValueState("Error");
						} else {
							oInput.setValueState("None");
							_that.getView().byId("idCstCntre").setValue(data.results[0].Ltext + " " + "(" + data.results[0].Kostl + ")");
						}
					},
					error: function (response) {
						MessageBox.alert(oResourceBundle.getText("noCstCntreAvlbl") + " " + "(" + selectedCostCenter + ")");
						oInput.setValueState("Error");
					}
				});
			}
			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},
		ordrValueHelpRequest: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var resourceBundle = this.getResourceBundle();
			this.selectVendorDialog = new sap.m.SelectDialog({
				title: resourceBundle.getText("ordrNum"),
				items: {
					path: "/OrderNumberRefSet",
					template: new sap.m.StandardListItem({
						title: "{Ktext}",
						description: "{Aufnr}"
					})
				},
				search: [
					this.ordNumbrSearch, this
				],
				confirm: [this.ordrSubmit,
					this
				],
				cancel: [this.onVendorDialogClose,
					this
				]
			});
			this.selectVendorDialog.setModel(oModel);
			this.selectVendorDialog.open();
		},
		ordNumbrSearch: function (oEvent) {
			var oFilter = "";
			var sQuery = oEvent.getParameter("value");
			if (sQuery && sQuery.length > 0) {
				oFilter = new Filter({
					filters: [
						new Filter({
							path: 'Aufnr',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						}),
						new Filter({
							path: 'Ktext',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						})
					],
					and: true
				});
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(oFilter);
		},
		ordrSubmit: function (oEvent) {
			var oInput = this.byId("idOrdr");
			var oResourceBundle = this.getResourceBundle();
			var aContexts = "";
			var _that = this;
			var selectedOreder = "";
			var selectedOrederText = "";
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getDescription();
				aContexts = oEvent.getParameter("selectedContexts");
				aContexts.map(function (oContext) {
					selectedOreder = oContext.getObject().Aufnr;
					selectedOrederText = oContext.getObject().Ktext;
				});
				oInput.setValueState("None");
				oInput.setValue(selectedOrederText + " " + "(" + selectedOreder + ")");
			} else {
				selectedOreder = oEvent.getSource().getProperty("value");
				var filterByAufnr = new sap.ui.model.Filter({
					path: "Aufnr", // string
					operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
					value1: selectedOreder // object
				});
				this.getOwnerComponent().getModel().read("/OrderNumberRefSet", {
					filters: [filterByAufnr],
					success: function (data, response) {
						if (!(data.results.length)) {
							MessageBox.alert(oResourceBundle.getText("noOrdrAvlble") + " " + "(" + selectedOreder + ")");
							oInput.setValueState("Error");
						} else {
							oInput.setValueState("None");
							_that.getView().byId("idOrdr").setValue(data.results[0].Ktext + " " + "(" + data.results[0].Aufnr + ")");
						}
					},
					error: function (response) {
						MessageBox.alert(oResourceBundle.getText("noOrdrAvlble") + " " + "(" + selectedOreder + ")");
						oInput.setValueState("Error");
					}
				});
			}
			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},
		gbsValueHelpRequest: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var resourceBundle = this.getResourceBundle();
			this.selectVendorDialog = new sap.m.SelectDialog({
				title: resourceBundle.getText("wbsElmnt"),
				items: {
					path: "/WBSElementSet",
					template: new sap.m.StandardListItem({
						title: "{Post1}",
						description: "{Posid}"
					})
				},
				search: [
					this.onWBSSearch, this
				],
				confirm: [this.gbsSubmit,
					this
				],
				cancel: [this.onVendorDialogClose,
					this
				]
			});
			this.selectVendorDialog.setModel(oModel);
			this.selectVendorDialog.open();
		},
		onWBSSearch: function (oEvent) {
			var oFilter = "";
			var sQuery = oEvent.getParameter("value");
			if (sQuery && sQuery.length > 0) {
				oFilter = new Filter({
					filters: [
						new Filter({
							path: 'Posid',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						}),
						new Filter({
							path: 'Post1',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						})
					],
					and: true
				});
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(oFilter);
		},
		gbsSubmit: function (oEvent) {
			var oInput = this.byId("idGbs");
			var oResourceBundle = this.getResourceBundle();
			var aContexts = "";
			var _that = this;
			var selectedWBS = "";
			var selectedWBSText = "";
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getDescription();
				aContexts = oEvent.getParameter("selectedContexts");
				aContexts.map(function (oContext) {
					selectedWBS = oContext.getObject().Posid;
					selectedWBSText = oContext.getObject().Post1;
				});
				oInput.setValueState("None");
				oInput.setValue(selectedWBSText + " " + "(" + selectedWBS + ")");
			} else {
				selectedWBS = oEvent.getSource().getProperty("value");
				var filterByPosid = new sap.ui.model.Filter({
					path: "Posid", // string
					operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
					value1: selectedWBS // object
				});
				this.getOwnerComponent().getModel().read("/WBSElementSet", {
					filters: [filterByPosid],
					success: function (data, response) {
						if (!(data.results.length)) {
							MessageBox.alert(oResourceBundle.getText("noWBSAvlble") + " " + "(" + selectedWBS + ")");
							oInput.setValueState("Error");
						} else {
							oInput.setValueState("None");
							_that.getView().byId("idGbs").setValue(data.results[0].Post1 + " " + "(" + data.results[0].Posid + ")");
						}
					},
					error: function (response) {
						MessageBox.alert(oResourceBundle.getText("noWBSAvlble") + " " + "(" + selectedWBS + ")");
						oInput.setValueState("Error");
					}
				});
			}
			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},

		onVndValueHelpRequest: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var resourceBundle = this.getResourceBundle();
			var selectedFunction = this.getView().byId("idFunct").getValue();
			var dialogHeaderText = "";
			var filters = [];
			if (selectedFunction) {
				var filterByParvw = new sap.ui.model.Filter({
					path: "Parvw", // string
					operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
					value1: selectedFunction // object
				});
				filters.push(filterByParvw);
			}
			if (selectedFunction === "ZA") {
				dialogHeaderText = "";
				dialogHeaderText = resourceBundle.getText("slctApprvngMngr");
			} else {
				dialogHeaderText = "";
				dialogHeaderText = resourceBundle.getText("slctVndr");
			}

			this.selectVendorDialog = new sap.m.SelectDialog({
				title: dialogHeaderText,
				items: {
					path: "/PersonVendorListSet",
					filters: filters,
					template: new sap.m.StandardListItem({
						title: "{Name1}",
						description: "{Lifnr}"
					})
				},
				liveChange: [
					this.onVndSearch, this
				],
				confirm: [this.onVndSelection,
					this
				],
				cancel: [this.onVendorDialogClose,
					this
				]
			});
			this.selectVendorDialog.setModel(oModel);
			this.selectVendorDialog.open();
		},
		onVndSearch: function (oEvent) {
			var oFilter = "";
			var sQuery = oEvent.getParameter("value");
			var sQuery2 = this.getView().byId("idFunct").getValue();
			var filters = [];
			if (sQuery && sQuery.length > 2) {
				oFilter = new Filter({
					filters: [
						new Filter({
							path: 'Lifnr',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						}),
						new Filter({
							path: 'Name1',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						})
					],
					and: true
				});
				if (!sQuery2) {
					var sFilter = new Filter({
						path: 'Parvw',
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sQuery
					});
					oFilter.aFilters.push(sFilter);
				}
				filters.push(oFilter);
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(filters);
		},
		onVndSelection: function (oEvent) {
			var oInput = this.byId("idVendorName");
			var oInput2 = this.byId("idNumber");
			var oResourceBundle = this.getResourceBundle();
			var aContexts = "";
			var _that = this;
			var selectedVendorId = "";
			var selectedVendorName = "";
			var selectedParvw = "";
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getDescription();
				aContexts = oEvent.getParameter("selectedContexts");
				aContexts.map(function (oContext) {
					selectedVendorId = oContext.getObject().Lifnr;
					selectedVendorName = oContext.getObject().Name1;
				});
				oInput.setValueState("None");
				oInput2.setValueState("None");
				oInput.setValue(selectedVendorName);
				oInput2.setValue(selectedVendorId);
			} else {
				selectedVendorId = oEvent.getSource().getProperty("value");
				selectedParvw = this.getView().byId("idFunct").getValue();
				var filterByVendorId = new sap.ui.model.Filter({
					path: "Lifnr", // string
					operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
					value1: selectedVendorId // object
				});
				var filterByParvw = new sap.ui.model.Filter({
					path: "Parvw", // string
					operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
					value1: selectedParvw // object
				});
				this.getOwnerComponent().getModel().read("/PersonVendorListSet", {
					filters: [filterByVendorId, filterByParvw],
					success: function (data, response) {
						if (!((data.results).length)) {
							MessageBox.alert(oResourceBundle.getText("noVndrAvlbl") + " " + "(" + selectedVendorId + ")");
							oInput.setValueState("Error");
							oInput2.setValueState("Error");
						} else {
							oInput.setValueState("None");
							oInput2.setValueState("None");
							_that.getView().byId("idVendorName").setValue(data.results[0].Lifnr);
							_that.getView().byId("idVendorName").setValue(data.results[0].Name1);
						}
					},
					error: function (response) {
						MessageBox.alert(oResourceBundle.getText("noVndrAvlbl") + " " + "(" + selectedVendorId + ")");
						oInput.setValueState("Error");
						oInput2.setValueState("Error");
					}
				});
			}
			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},

		commnChange: function (oEvent) {
			var oView = this.getView();
			var commValue = oEvent.getParameters().value;
			var $input = commValue;
			if ((oEvent.getSource().getId()).includes("idOun")) {
				oView.byId("idOun").setValueState("None");
			} else if ((oEvent.getSource().getId()).includes("idMtrlGrp")) {
				oView.byId("idMtrlGrp").setValueState("None");
			} else if ((oEvent.getSource().getId()).includes("idGlAcc")) {
				oView.byId("idGlAcc").setValueState("None");
			} else if ((oEvent.getSource().getId()).includes("idCstCntre")) {
				oView.byId("idCstCntre").setValueState("None");
			} else if ((oEvent.getSource().getId()).includes("idOrdr")) {
				oView.byId("idOrdr").setValueState("None");
			} else if ((oEvent.getSource().getId()).includes("idGbs")) {
				oView.byId("idGbs").setValueState("None");
			} else if ((oEvent.getSource().getId()).includes("idVendor")) {
				oView.byId("idVendor").setValueState("None");
			}
			if ($input) {
				oEvent.getSource().setValue($input);
			} else {
				oEvent.getSource().setDOMValue("");
			}
		},
		onAddItemPress: function () {
			setTimeout(function () {
				$(".dateInputHide").find("input").attr("readonly", true);
			}, 200);
			var oView = this.getView();
			oView.byId("idAddItem").setVisible(true);
			oView.byId("idUpdateItem").setVisible(false);
			oView.byId("idItemSubSection").setVisible(false);
			oView.byId("idPartnersSubSection").setVisible(false);
			oView.byId("idAddNewItem").setVisible(true);
			//Clear fields//
			var itemsTable = this.getView().byId("idItemsTable");
			if (itemsTable.getItems().length) {
				var itemTableModel = itemsTable.getModel("itemTableModelName").getData().results;
				itemCount = parseInt(itemTableModel[(itemTableModel.length - 1)].Item) + 10;
			} else {
				itemCount = itemCount + 10;
			}
			var todayDate = new Date();
			var tomorrow = this.formattingDate(new Date(todayDate.getTime() + 1000 * 60 * 60 * 24));
			oView.byId("idItem").setValue(itemCount);
			oView.byId("idAccAGnmnt").setValue("");
			oView.byId("idAccAGnmnt").setSelectedKey("");
			oView.byId("idAccAGnmnt").setValueState("None");
			oView.byId("idShrtTxt").setValue("");
			oView.byId("idShrtTxt").setValueState("None");
			oView.byId("idPoQty").setValue("");
			oView.byId("idPoQty").setValueState("None");
			oView.byId("idOun").setValue("");
			oView.byId("idOun").setValueState("None");
			oView.byId("idNetPrice").setValue("");
			oView.byId("idNetPrice").setValueState("None");
			oView.byId("idDelvDt").setValue(tomorrow);
			oView.byId("idDelvDt").setValueState("None");
			oView.byId("idMtrlGrp").setValue("");
			oView.byId("idMtrlGrp").setValueState("None");
			oView.byId("idGlAcc").setValue("");
			oView.byId("idGlAcc").setValueState("None");
			oView.byId("idCstCntreLbl").setVisible(true);
			oView.byId("idCstCntreTxt").setVisible(true);
			oView.byId("idCstCntre").setVisible(true);
			oView.byId("idCstCntre").setValue("");
			oView.byId("idCstCntre").setValueState("None");
			oView.byId("idOrdLbl").setVisible(true);
			oView.byId("idOrdrTxt").setVisible(true);
			oView.byId("idOrdr").setVisible(true);
			oView.byId("idOrdr").setValue("");
			oView.byId("idOrdLbl").setRequired(true);
			oView.byId("idOrdr").setValueState("None");
			oView.byId("idGbsLbl").setVisible(true);
			oView.byId("idGbsTxt").setVisible(true);
			oView.byId("idGbs").setVisible(true);
			oView.byId("idGbs").setValue("");
			oView.byId("idGbs").setValueState("None");
			oView.byId("idRetPoChkBox").setSelected(false);
		},
		nullCheck: function (value) {
			if (value) {
				return value;
			} else {
				return "";
			}
		},
		onAddItem: function (oEvent) {
			var oView = this.getView();
			var itemTableItem = {
				results: []
			};
			var poNetValueCount = 0;
			var itemTableExistingModel = oView.byId("idItemsTable").getModel("itemTableModelName");
			var canProceed = true;
			var resourceBundle = this.getResourceBundle();
			var selectedAccAssCatgry = "";
			// var retPOChkBoxCheck = "";
			if (oView.byId("idAccAGnmnt").getSelectedItem()) {
				selectedAccAssCatgry = oView.byId("idAccAGnmnt").getSelectedItem().getKey();
			} else {
				selectedAccAssCatgry = oView.byId("idAccAGnmnt").getValue().split("(")[0].trim();
			}
			var inputs = [];
			if (selectedAccAssCatgry === "K") {
				inputs.push(oView.byId("idAccAGnmnt"));
				inputs.push(oView.byId("idShrtTxt"));
				inputs.push(oView.byId("idPoQty"));
				inputs.push(oView.byId("idOun"));
				inputs.push(oView.byId("idNetPrice"));
				inputs.push(oView.byId("idDelvDt"));
				inputs.push(oView.byId("idMtrlGrp"));
				inputs.push(oView.byId("idGlAcc"));
				inputs.push(oView.byId("idCstCntre"));
			} else if (selectedAccAssCatgry === "F") {
				inputs.push(oView.byId("idAccAGnmnt"));
				inputs.push(oView.byId("idShrtTxt"));
				inputs.push(oView.byId("idPoQty"));
				inputs.push(oView.byId("idOun"));
				inputs.push(oView.byId("idNetPrice"));
				inputs.push(oView.byId("idDelvDt"));
				inputs.push(oView.byId("idMtrlGrp"));
				inputs.push(oView.byId("idGlAcc"));
				inputs.push(oView.byId("idOrdr"));
			} else if (selectedAccAssCatgry === "P") {
				inputs.push(oView.byId("idAccAGnmnt"));
				inputs.push(oView.byId("idShrtTxt"));
				inputs.push(oView.byId("idPoQty"));
				inputs.push(oView.byId("idOun"));
				inputs.push(oView.byId("idNetPrice"));
				inputs.push(oView.byId("idDelvDt"));
				inputs.push(oView.byId("idMtrlGrp"));
				inputs.push(oView.byId("idGlAcc"));
				inputs.push(oView.byId("idGbs"));
			} else {
				inputs.push(oView.byId("idAccAGnmnt"));
				inputs.push(oView.byId("idShrtTxt"));
				inputs.push(oView.byId("idPoQty"));
				inputs.push(oView.byId("idOun"));
				inputs.push(oView.byId("idNetPrice"));
				inputs.push(oView.byId("idDelvDt"));
				inputs.push(oView.byId("idMtrlGrp"));
				inputs.push(oView.byId("idGlAcc"));
				inputs.push(oView.byId("idCstCntre"));
				if (oView.byId("idOrdLbl").getRequired()) {
					inputs.push(oView.byId("idOrdr"));
				}
				inputs.push(oView.byId("idGbs"));
			}

			jQuery.each(inputs, function (i, input) {
				if (input.getValue() && input.getProperty("visible")) {
					input.setValueState("None");
				} else if (!input.getValue() && input.getProperty("visible")) {
					input.setValueState("Error");
					canProceed = false;
				}
			});
			if (!canProceed) {
				MessageBox.alert(resourceBundle.getText("plsFillUp"));
			} else {
				if (this.mandtFldValidationCheck()) {
					var itemTableSingleItemAdd = {
						"Item": oView.byId("idItem").getValue(),
						"AccAssgmt": oView.byId("idAccAGnmnt").getSelectedItem().getText(),
						"ShortText": oView.byId("idShrtTxt").getValue(),
						"POQty": oView.byId("idPoQty").getValue(),
						"OUn": oView.byId("idOun").getValue(),
						"NetPrice": oView.byId("idNetPrice").getValue(),
						"DelivDate": oView.byId("idDelvDt").getValue(),
						"MatlGroup": oView.byId("idMtrlGrp").getValue(),
						"GL": oView.byId("idGlAcc").getValue(),
						"CostCenter": this.nullCheck(oView.byId("idCstCntre").getValue()),
						"Order": this.nullCheck(oView.byId("idOrdr").getValue()),
						"Gbs": this.nullCheck(oView.byId("idGbs").getValue()),
						"selected": false,
						"RETPO": false
					};
					if (oView.byId("idRetPoChkBox").getSelected()) {
						itemTableSingleItemAdd.RETPO = true;
					}
					// if (copiedPersonalSettingsItems) {
					// for (var ntpLcv = 0; ntpLcv < copiedPersonalSettingsItems.results.length; ntpLcv++) {
					// 	if ((copiedPersonalSettingsItems.results[ntpLcv].Element).includes("WAERS"))
					// 		itemTableSingleItemAdd.NetPrice = itemTableSingleItemAdd.NetPrice + " " + copiedPersonalSettingsItems.results[ntpLcv].Active;
					// }
					// } else if (copiedPersonalSettingsItems2) {
					// 	for (var ntpLcv2 = 0; ntpLcv2 < copiedPersonalSettingsItems2.PerSetHdToItmNav.results.length; ntpLcv2++) {
					// 		if ((copiedPersonalSettingsItems2.PerSetHdToItmNav.results[ntpLcv2].Element).includes("WAERS"))
					// 			itemTableSingleItemAdd.NetPrice = itemTableSingleItemAdd.NetPrice + " " + copiedPersonalSettingsItems2.PerSetHdToItmNav.results[
					// 				ntpLcv2].Active;
					// 	}
					// }
					if (currencyDependingOnVendor.length) {
						itemTableSingleItemAdd.NetPrice = (parseFloat(itemTableSingleItemAdd.NetPrice).toFixed(2)) + " " + currencyDependingOnVendor[0];
					} else {
						itemTableSingleItemAdd.NetPrice = (parseFloat(itemTableSingleItemAdd.NetPrice).toFixed(2)) + " " + " ";
					}
					itemTableSingleItemAdd.POQty = itemTableSingleItemAdd.POQty + " " + (itemTableSingleItemAdd.OUn.split("(")[1].split(")")[0]);
					oView.byId("idItemSubSection").setVisible(true);
					oView.byId("idPartnersSubSection").setVisible(true);
					oView.byId("idAddNewItem").setVisible(false);
					if (oView.byId("idItemsTable").getItems().length > 0) {
						itemTableExistingModel.getData().results.push(itemTableSingleItemAdd);
						for (var iLcv = 0; iLcv < itemTableExistingModel.getData().results.length; iLcv++) {

							if (itemTableExistingModel.getData().results[iLcv].RETPO) {
								poNetValueCount = (parseFloat(poNetValueCount) - (parseFloat(itemTableExistingModel.getData().results[iLcv].NetPrice)) * (
									parseFloat(itemTableExistingModel.getData().results[iLcv].POQty))).toFixed(2);
							} else {
								poNetValueCount = (parseFloat(poNetValueCount) + (parseFloat(itemTableExistingModel.getData().results[iLcv].NetPrice)) * (
									parseFloat(itemTableExistingModel.getData().results[iLcv].POQty))).toFixed(2);
							}
						}
						oView.byId("idPoNetValue").setText(poNetValueCount + " " + (itemTableExistingModel.getData().results[0].NetPrice).split(" ")[1]);
						itemTableSingleItemAdd = {};
						if (oView.byId("idItemsTable").getColumns()[0].mAggregations.header.getSelected()) {
							oView.byId("idItemsTable").getColumns()[0].mAggregations.header.setSelected(false);
						}
						itemTableExistingModel.refresh();
					} else {
						itemTableItem.results.push(itemTableSingleItemAdd);
						var itemTableModel = new JSONModel(itemTableItem);
						for (var iLcv2 = 0; iLcv2 < itemTableItem.results.length; iLcv2++) {
							// poNetValueCount = (parseFloat(poNetValueCount) + (parseFloat(itemTableItem.results[iLcv2].NetPrice)) * (parseFloat(
							// 	itemTableItem.results[iLcv2].POQty))).toFixed(2);
							if (itemTableItem.results[iLcv2].RETPO) {
								poNetValueCount = (parseFloat(poNetValueCount) - (parseFloat(itemTableItem.results[iLcv2].NetPrice)) * (
									parseFloat(itemTableItem.results[iLcv2].POQty))).toFixed(2);
							} else {
								poNetValueCount = (parseFloat(poNetValueCount) + (parseFloat(itemTableItem.results[iLcv2].NetPrice)) * (
									parseFloat(itemTableItem.results[iLcv2].POQty))).toFixed(2);
							}
						}
						oView.byId("idPoNetValue").setText(poNetValueCount + " " + (itemTableItem.results[0].NetPrice).split(" ")[1]);
						this.setModel(itemTableModel, "itemTableModelName");
						itemTableSingleItemAdd = {};
					}
					oView.byId("retPOCheckFrmTbl").setEditable(false);
					MessageToast.show(resourceBundle.getText("itmAddedSuccessfully"));
				} else {
					MessageBox.alert(resourceBundle.getText("plsSelect"));
				}
			}
		},
		onAddItemCancel: function () {
			var oView = this.getView();
			oView.byId("idItemSubSection").setVisible(true);
			oView.byId("idPartnersSubSection").setVisible(true);
			oView.byId("idAddNewItem").setVisible(false);
			oView.byId("idAddPartner").setVisible(false);
			itemCount = itemCount - 10;
		},
		onPersonalSettingsPress: function (oEvent) {
			this.openPersonalSettingsDialog().open();
			var oView = sap.ui.getCore();
			// if (this.getView().byId("idVendor").getValue()) {
			// for (var psLcv = 0; psLcv < copiedPersonalSettingsItems.results.length; psLcv++) {
			// 	if ((copiedPersonalSettingsItems.results[psLcv].Element).includes("EKORG")) {
			// 		oView.byId("idPurchOrg").setSelectedKey(copiedPersonalSettingsItems.results[psLcv].Active);
			// 	} else if ((copiedPersonalSettingsItems.results[psLcv].Element).includes("EKGRP")) {
			// 		oView.byId("idPurchGrp").setSelectedKey(copiedPersonalSettingsItems.results[psLcv].Active);
			// 	}

			// 	// else if ((copiedPersonalSettingsItems.results[psLcv].Element).includes("WAERS")) {
			// 	// 	oView.byId("idCurrency").setSelectedKey(copiedPersonalSettingsItems.results[psLcv].Active);
			// 	// } 
			// 	else if ((copiedPersonalSettingsItems.results[psLcv].Element).includes("BUKRS")) {
			// 		oView.byId("idCompCode").setSelectedKey(copiedPersonalSettingsItems.results[psLcv].Active);
			// 	}
			// }
			oView.byId("idPurchOrg").setValueState("None");
			oView.byId("idPurchGrp").setValueState("None"); 
			oView.byId("idCurrency").setValueState("None"); 
			oView.byId("idCompCode").setValueState("None"); 
			this.getOwnerComponent().getModel().read("/PersonalSettingsSet", {
				success: function (data, response) {
					for (var psLcv = 0; psLcv < data.results.length; psLcv++) {
						if ((data.results[psLcv].Element).includes("EKORG")) {
							oView.byId("idPurchOrg").setSelectedKey(data.results[psLcv].Active);
						} else if ((data.results[psLcv].Element).includes("EKGRP")) {
							oView.byId("idPurchGrp").setSelectedKey(data.results[psLcv].Active);
						} else if ((data.results[psLcv].Element).includes("BUKRS")) {
							oView.byId("idCompCode").setSelectedKey(data.results[psLcv].Active);
						}
					}
				},
				error: function (response) {}
			});
			if (currencyDependingOnVendor.length) {
				oView.byId("idCurrency").setSelectedKey(currencyDependingOnVendor[0]);
			} else {
				oView.byId("idCurrency").setSelectedKey("");
			}
		},
		openPersonalSettingsDialog: function () {
			var _self = this;
			if (!_self.personalSettingsDialog) {
				_self.personalSettingsDialog = sap.ui.xmlfragment("wel.CreatePO.fragments.PersonalSettings",
					_self);
				_self.getView().addDependent(_self.personalSettingsDialog);
			}
			return this.personalSettingsDialog;
		},
		onPersonalSettingsDialogClose: function () {
			this.openPersonalSettingsDialog().close();
		},
		onAddPartnerPress: function () {
			var oView = this.getView();
			oView.byId("idItemSubSection").setVisible(false);
			oView.byId("idPartnersSubSection").setVisible(false);
			oView.byId("idAddNewItem").setVisible(false);
			oView.byId("idUpdatePartnerButton").setVisible(false);
			oView.byId("idAddPartner").setVisible(true);
			oView.byId("idAddPartnerButton").setVisible(true);
			//Clear Partners fields//
			oView.byId("idFunct").setValue("");
			oView.byId("idName").setValue("");
			oView.byId("idNumber").setValue("");
			oView.byId("idVendorName").setValue("");
		},
		formattingDate: function (dateValuee) {
			if (dateValuee) {
				var d = new Date(dateValuee);
				var dateInst = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd/MM/yyyy"
				});
				var DateV = dateInst.format(d);
				return DateV;
			}
		},
		itemTableSelectionChange: function (oEvent) {
			setTimeout(function () {
				$(".dateInputHide").find("input").attr("readonly", true);
			}, 200);
			var oView = this.getView();
			this.selectedItemIndex = "";
			oView.byId("idAddItem").setVisible(false);
			oView.byId("idUpdateItem").setVisible(true);
			this.selectedItemIndex = oEvent.getSource().getSelectedContextPaths()[0].split("/")[2];
			var selectedRow = oView.byId("idItemsTable").getModel("itemTableModelName").getData().results[this.selectedItemIndex];
			oView.byId("idItemSubSection").setVisible(false);
			oView.byId("idPartnersSubSection").setVisible(false);
			if (selectedRow.RETPO) {
				oView.byId("idRetPoChkBox").setSelected(true);
			} else {
				oView.byId("idRetPoChkBox").setSelected(false);
			}
			if (selectedRow.AccAssgmt.split("(")[0].trim() === "F") {
				oView.byId("idGbsLbl").setVisible(false);
				oView.byId("idGbsTxt").setVisible(false);
				oView.byId("idGbs").setVisible(false);
				oView.byId("idOrdLbl").setRequired(true);
				oView.byId("idOrdLbl").setVisible(true);
				oView.byId("idOrdrTxt").setVisible(true);
				oView.byId("idOrdr").setVisible(true);
				oView.byId("idCstCntreLbl").setVisible(false);
				oView.byId("idCstCntreTxt").setVisible(false);
				oView.byId("idCstCntre").setVisible(false);
			} else if (selectedRow.AccAssgmt.split("(")[0].trim() === "K") {
				oView.byId("idOrdLbl").setVisible(true);
				oView.byId("idOrdrTxt").setVisible(true);
				oView.byId("idOrdr").setVisible(true);
				oView.byId("idOrdLbl").setRequired(false);
				oView.byId("idGbsLbl").setVisible(false);
				oView.byId("idGbsTxt").setVisible(false);
				oView.byId("idGbs").setVisible(false);
				oView.byId("idCstCntreLbl").setVisible(true);
				oView.byId("idCstCntreTxt").setVisible(true);
				oView.byId("idCstCntre").setVisible(true);
			} else {
				oView.byId("idOrdLbl").setVisible(false);
				oView.byId("idOrdrTxt").setVisible(false);
				oView.byId("idOrdr").setVisible(false);
				oView.byId("idOrdLbl").setRequired(false);
				oView.byId("idCstCntreLbl").setVisible(false);
				oView.byId("idCstCntreTxt").setVisible(false);
				oView.byId("idCstCntre").setVisible(false);
				oView.byId("idGbsLbl").setVisible(true);
				oView.byId("idGbsTxt").setVisible(true);
				oView.byId("idGbs").setVisible(true);
			}
			oView.byId("idAddNewItem").setVisible(true);
			oView.byId("idAccAGnmnt").setSelectedKey("");
			oView.byId("idAccAGnmnt").setValue(selectedRow.AccAssgmt);
			oView.byId("idItem").setValue(selectedRow.Item);
			oView.byId("idShrtTxt").setValue(selectedRow.ShortText);
			oView.byId("idPoQty").setValue(selectedRow.POQty.split(" ")[0]);
			oView.byId("idOun").setValue(selectedRow.OUn);
			oView.byId("idNetPrice").setValue(selectedRow.NetPrice.split(" ")[0]);
			oView.byId("idDelvDt").setValue(selectedRow.DelivDate);
			oView.byId("idMtrlGrp").setValue(selectedRow.MatlGroup);
			oView.byId("idGlAcc").setValue(selectedRow.GL);
			oView.byId("idCstCntre").setValue(selectedRow.CostCenter);
			oView.byId("idOrdr").setValue(selectedRow.Order);
			oView.byId("idGbs").setValue(selectedRow.Gbs);
			oEvent.getSource().getSelectedItem().setSelected(false);
		},
		checkSelectedValue: function (value) {
			if (value) {
				return value.getText();
			} else {
				return "";
			}
		},
		onUpdateItem: function () {
			var oView = this.getView();
			var selectedItemIndexVal = this.selectedItemIndex;
			var canBeProceed = true;
			var resourceBundle = this.getResourceBundle();
			var selectedAccAssCatgry = oView.byId("idAccAGnmnt").getValue().split("(")[0].trim();
			var inputs = [];
			var retPOChkBoxChkAndUnChk = oView.byId("idRetPoChkBox").getSelected();
			if (selectedAccAssCatgry === "K") {
				inputs.push(oView.byId("idAccAGnmnt"));
				inputs.push(oView.byId("idShrtTxt"));
				inputs.push(oView.byId("idPoQty"));
				inputs.push(oView.byId("idOun"));
				inputs.push(oView.byId("idNetPrice"));
				inputs.push(oView.byId("idDelvDt"));
				inputs.push(oView.byId("idMtrlGrp"));
				inputs.push(oView.byId("idGlAcc"));
				inputs.push(oView.byId("idCstCntre"));
				inputs.push(oView.byId("idGbs"));
			} else if (selectedAccAssCatgry === "P") {
				inputs.push(oView.byId("idAccAGnmnt"));
				inputs.push(oView.byId("idShrtTxt"));
				inputs.push(oView.byId("idPoQty"));
				inputs.push(oView.byId("idOun"));
				inputs.push(oView.byId("idNetPrice"));
				inputs.push(oView.byId("idDelvDt"));
				inputs.push(oView.byId("idMtrlGrp"));
				inputs.push(oView.byId("idGlAcc"));
				inputs.push(oView.byId("idGbs"));
			} else if (selectedAccAssCatgry === "F") {
				inputs.push(oView.byId("idAccAGnmnt"));
				inputs.push(oView.byId("idShrtTxt"));
				inputs.push(oView.byId("idPoQty"));
				inputs.push(oView.byId("idOun"));
				inputs.push(oView.byId("idNetPrice"));
				inputs.push(oView.byId("idDelvDt"));
				inputs.push(oView.byId("idMtrlGrp"));
				inputs.push(oView.byId("idGlAcc"));
				inputs.push(oView.byId("idOrdr"));
			} else {
				inputs.push(oView.byId("idAccAGnmnt"));
				inputs.push(oView.byId("idShrtTxt"));
				inputs.push(oView.byId("idPoQty"));
				inputs.push(oView.byId("idOun"));
				inputs.push(oView.byId("idNetPrice"));
				inputs.push(oView.byId("idDelvDt"));
				inputs.push(oView.byId("idMtrlGrp"));
				inputs.push(oView.byId("idGlAcc"));
				inputs.push(oView.byId("idCstCntre"));
				if (oView.byId("idOrdLbl").getRequired()) {
					inputs.push(oView.byId("idOrdr"));
				}
				inputs.push(oView.byId("idGbs"));
			}
			jQuery.each(inputs, function (i, input) {
				if (input.getValue() && input.getProperty("visible")) {
					input.setValueState("None");
				} else if (!input.getValue() && input.getProperty("visible")) {
					input.setValueState("Error");
					canBeProceed = false;
				}
			});
			if (!canBeProceed) {
				MessageBox.alert(resourceBundle.getText("plsFillUp"));
			} else {
				if (this.mandtFldValidationCheck()) {
					var updatedRowObject = {
						"Item": oView.byId("idItem").getValue(),
						"AccAssgmt": oView.byId("idAccAGnmnt").getValue(),
						"ShortText": oView.byId("idShrtTxt").getValue(),
						"POQty": oView.byId("idPoQty").getValue(),
						"OUn": oView.byId("idOun").getValue(),
						"NetPrice": oView.byId("idNetPrice").getValue(),
						"DelivDate": oView.byId("idDelvDt").getValue(),
						"MatlGroup": oView.byId("idMtrlGrp").getValue(),
						"GL": oView.byId("idGlAcc").getValue(),
						"CostCenter": this.nullCheck(oView.byId("idCstCntre").getValue()),
						"Order": this.nullCheck(oView.byId("idOrdr").getValue()),
						"Gbs": this.nullCheck(oView.byId("idGbs").getValue()),
						"RETPO": false
					};
					if (retPOChkBoxChkAndUnChk) {
						updatedRowObject.RETPO = true;
					}
					// if (copiedPersonalSettingsItems) {
					// 	for (var ntpLcv = 0; ntpLcv < copiedPersonalSettingsItems.results.length; ntpLcv++) {
					// 		if ((copiedPersonalSettingsItems.results[ntpLcv].Element).includes("WAERS"))
					// 			updatedRowObject.NetPrice = updatedRowObject.NetPrice + " " + copiedPersonalSettingsItems.results[ntpLcv].Active;
					// 	}
					// } else if (copiedPersonalSettingsItems2) {
					// 	for (var ntpLcv2 = 0; ntpLcv2 < copiedPersonalSettingsItems2.PerSetHdToItmNav.results.length; ntpLcv2++) {
					// 		if ((copiedPersonalSettingsItems2.PerSetHdToItmNav.results[ntpLcv2].Element).includes("WAERS"))
					// 			updatedRowObject.NetPrice = updatedRowObject.NetPrice + " " + copiedPersonalSettingsItems2.PerSetHdToItmNav.results[ntpLcv2].Active;
					// 	}
					// }
					updatedRowObject.POQty = updatedRowObject.POQty + " " + (updatedRowObject.OUn.split("(")[1].split(")")[0]);
					if (currencyDependingOnVendor.length) {
						updatedRowObject.NetPrice = updatedRowObject.NetPrice + " " + currencyDependingOnVendor[0];
					} else {
						updatedRowObject.NetPrice = updatedRowObject.NetPrice + " " + " ";
					}
					if (oView.byId("idItemsTable").getColumns()[0].mAggregations.header.getSelected()) {
						oView.byId("idItemsTable").getColumns()[0].mAggregations.header.setSelected(false);
					}
					oView.byId("idItemsTable").getModel("itemTableModelName").getData().results.splice(selectedItemIndexVal, 1);
					oView.byId("idItemsTable").getModel("itemTableModelName").getData().results.splice(selectedItemIndexVal, 0, updatedRowObject);
					var updatedItemTableModel = new JSONModel(oView.byId("idItemsTable").getModel("itemTableModelName").getData());
					this.setModel(updatedItemTableModel, "itemTableModelName");
					var poNetValue = 0;
					// var currency = "";
					for (var npuLcv = 0; npuLcv < (this.getView().byId("idItemsTable").getModel("itemTableModelName").getData().results).length; npuLcv++) {
						if (this.getView().byId("idItemsTable").getModel("itemTableModelName").getData().results[npuLcv].RETPO) {
							poNetValue = (parseFloat(poNetValue) - (parseFloat(this.getView().byId("idItemsTable").getModel("itemTableModelName").getData()
								.results[
									npuLcv]
								.NetPrice) * parseFloat(this.getView().byId("idItemsTable").getModel("itemTableModelName").getData().results[npuLcv]
								.POQty))).toFixed(2);
						} else {
							poNetValue = (parseFloat(poNetValue) + (parseFloat(this.getView().byId("idItemsTable").getModel("itemTableModelName").getData()
								.results[
									npuLcv]
								.NetPrice) * parseFloat(this.getView().byId("idItemsTable").getModel("itemTableModelName").getData().results[npuLcv]
								.POQty))).toFixed(2);
						}
					}
					// poNetValue = poNetValue + " " + ((this.getView().byId("idItemsTable").getModel("itemTableModelName").getData().results[this.selectedItemIndex])
					// 	.NetPrice).split(" ")[1];
					if (currencyDependingOnVendor.length) {
						poNetValue = poNetValue + " " + currencyDependingOnVendor[0];
					} else {
						poNetValue = poNetValue + " " + " ";
					}
					this.getView().byId("idPoNetValue").setText(poNetValue);
					updatedRowObject = {};
					this.selectedItemIndex = "";
					oView.byId("idItemSubSection").setVisible(true);
					oView.byId("idPartnersSubSection").setVisible(true);
					oView.byId("idAddNewItem").setVisible(false);
					oView.byId("idAddPartner").setVisible(false);
				} else {
					MessageBox.alert(resourceBundle.getText("plsSelect"));
				}

			}
		},
		selectAllRows: function (oEvent) {
			var itemTableRecords = this.getView().byId("idItemsTable").getModel("itemTableModelName").getData();
			if (oEvent.getSource().getParent().getParent().mAggregations.columns[0].getHeader().getSelected()) {
				for (var sAILcv = 0; sAILcv < itemTableRecords.results.length; sAILcv++) {
					this.getView().byId("idItemsTable").getItems()[sAILcv].mAggregations.cells[0].setSelected(true);
				}
			} else {
				for (var sAILcv2 = 0; sAILcv2 < itemTableRecords.results.length; sAILcv2++) {
					this.getView().byId("idItemsTable").getItems()[sAILcv2].mAggregations.cells[0].setSelected(false);
				}
			}
		},
		selectSingleRow: function (oEvent) {
			var itemTableLength = this.getView().byId("idItemsTable").getItems();
			var allSelected = false;
			for (var sRLcv = 0; sRLcv < itemTableLength.length; sRLcv++) {
				if (this.getView().byId("idItemsTable").getItems()[sRLcv].mAggregations.cells[0].getSelected()) {
					allSelected = true;
				} else {
					allSelected = false;
					// this.getView().byId("idItemsTable").getItems()[sRLcv].mAggregations.cells[0].setSelected(true);
					break;
				}
			}
			if (allSelected) {
				oEvent.getSource().getParent().getParent().mAggregations.columns[0].getHeader().setSelected(true);
			} else {
				oEvent.getSource().getParent().getParent().mAggregations.columns[0].getHeader().setSelected(false);
				// this.getView().byId("idItemsTable").getItems()[sRLcv].mAggregations.cells[0].setSelected(true);
			}
		},
		copyItemsFromItemTable: function (oEvent) {
			var itmSelected = true;
			var totNetPrice = 0;
			var itemsHavetoCopy = [];
			var resourceBundle = this.getResourceBundle();
			if (this.getView().byId("idItemsTable").getItems().length) {
				var itemTable = this.getView().byId("idItemsTable").getModel("itemTableModelName").getData();
				for (var ccItm = 0; ccItm < itemTable.results.length; ccItm++) {
					if (itemTable.results[ccItm].selected) {
						itemsHavetoCopy.push(itemTable.results[ccItm]);
					}
				}
				if (itemsHavetoCopy.length) {
					var copiedItemTableItems = "";
					copiedItemTableItems = jQuery.extend(true, {}, itemsHavetoCopy);
					for (var ciLcv2 = 0; ciLcv2 < itemsHavetoCopy.length; ciLcv2++) {
						if (itemsHavetoCopy.length > 0) {
							itemCount = parseInt(itemTable.results[itemTable.results.length - 1].Item) + 10;
							// itemTable.results
						} else {
							itemCount = itemCount + parseInt(itemsHavetoCopy[ciLcv2].Item);
						}
						copiedItemTableItems[ciLcv2].Item = itemCount.toString();
						copiedItemTableItems[ciLcv2].selected = false;
						itemTable.results.push(copiedItemTableItems[ciLcv2]);
					}
					for (var ciLcv3 = 0; ciLcv3 < itemTable.results.length; ciLcv3++) {
						if (itemTable.results[ciLcv3].RETPO) {
							totNetPrice = ((parseFloat(totNetPrice) - ((parseFloat(itemTable.results[ciLcv3].NetPrice)) * (parseFloat(itemTable.results[
								ciLcv3].POQty))))).toFixed(2);
						} else {
							totNetPrice = ((parseFloat(totNetPrice) + ((parseFloat(itemTable.results[ciLcv3].NetPrice)) * (parseFloat(itemTable.results[
								ciLcv3].POQty))))).toFixed(2);
						}
					}
					totNetPrice = totNetPrice + " " + (itemTable.results[0].NetPrice).split(" ")[1];
					this.getView().byId("idPoNetValue").setText(totNetPrice);
					this.getView().byId("idItemsTable").mAggregations.columns[0].getHeader().setSelected(false);
					this.getView().byId("idItemsTable").getModel("itemTableModelName").refresh();
				} else {
					MessageBox.alert(resourceBundle.getText("plsSelctItmme"));
				}
			} else {
				MessageBox.alert(resourceBundle.getText("plsAddItteemm"));
			}
		},
		onDeleteItem: function (oEvent) {
			var checkedItems = true;
			var colDelItems = [];
			var oView = this.getView();
			var resourceBundle = this.getResourceBundle();
			var itemTable = oView.byId("idItemsTable");
			var itemTableData = "";
			var itemTableModel = "";
			var totPoNetValue = oView.byId("idPoNetValue").getText();
			var fnlNetValue = "";
			var currency = "";
			if (itemTable.getItems().length) {
				itemTableModel = itemTable.getModel("itemTableModelName");
				itemTableData = itemTable.getModel("itemTableModelName").getData().results;
				for (var ditLcv = 0; ditLcv < itemTableData.length; ditLcv++) {
					if (itemTableData[ditLcv].selected) {

						colDelItems.push(itemTableData[ditLcv]);
					}
				}
				if (colDelItems.length) {
					for (var sILcv2 = (itemTableData.length - 1); sILcv2 >= 0; sILcv2--) {
						currency = "";
						if (itemTableData[sILcv2].selected) {
							if (itemTableData[sILcv2].RETPO) {
								totPoNetValue = ((parseFloat(totPoNetValue)) + (parseFloat(itemTableData[sILcv2].NetPrice) * parseFloat(itemTableData[sILcv2].POQty)))
									.toFixed(2);
							} else {
								totPoNetValue = ((parseFloat(totPoNetValue)) - (parseFloat(itemTableData[sILcv2].NetPrice) * parseFloat(itemTableData[sILcv2].POQty)))
									.toFixed(2);

							}
							itemTableData.splice(sILcv2, 1);
						}
					}
					if (currencyDependingOnVendor.length) {
						currency = currencyDependingOnVendor[0];
					} else {
						currency = "";
					}
					fnlNetValue = (parseFloat(totPoNetValue).toFixed(2)) + " " + currency;
					oView.byId("idPoNetValue").setText(fnlNetValue);
					oView.byId("idItemsTable").mAggregations.columns[0].getHeader().setSelected(false);
					itemTableModel.refresh();
					if (!itemTableData.length) {
						itemCount = 0
					}
				} else {
					MessageBox.alert(resourceBundle.getText("plsSelctRecdsFrmTbl"));
				}
			} else {
				MessageBox.alert(resourceBundle.getText("plsAddrcrdToTbl"));
			}
		},
		addPartnerMandtFldChk: function (oEvent) {
			var oView = this.getView();
			var canProceedFinal2 = true;
			var resourceBundle = this.getResourceBundle();
			var inputs = [
				oView.byId("idFunct"),
				oView.byId("idNumber"),
			];
			jQuery.each(inputs, function (i, input) {
				if (input.getValue()) {
					input.setValueState("None");
				} else if (!input.getValue()) {
					input.setValueState("Error");
					canProceedFinal2 = false;
				}
			});

			return canProceedFinal2;
		},
		addPartnerMandtFldChk2: function (oEvent) {
			var oView = this.getView();
			var canProceedFinal3 = true;
			var resourceBundle = this.getResourceBundle();
			var inputs = [
				oView.byId("idName"),
				oView.byId("idVendorName"),
			];
			jQuery.each(inputs, function (i, input) {
				if (input.getValue()) {
					input.setValueState("None");
				} else if (!input.getValue()) {
					input.setValueState("Error");
					canProceedFinal3 = false;
				}
			});

			return canProceedFinal3;
		},
		onAddPartner: function (oEvent) {
			var _self = this;
			var oView = this.getView();
			var canProceed2 = true;
			var resourceBundle = this.getResourceBundle();
			var inputs = [
				oView.byId("idFunct"),
				// oView.byId("idName"),
				oView.byId("idNumber")
				// oView.byId("idVendorName")
			];
			jQuery.each(inputs, function (i, input) {
				if (input.getValue()) {
					input.setValueState("None");
				} else if (!input.getValue()) {
					input.setValueState("Error");
					canProceed2 = false;
				}
			});
			if (!canProceed2) {
				MessageBox.alert(resourceBundle.getText("plsFillUp"));
			} else {
				if (this.addPartnerMandtFldChk()) {
					if (this.addPartnerMandtFldChk2()) {
						oView.byId("idAddNewItem").setVisible(false);
						var partnerTableExistingModel = oView.byId("idPartnersTable").getModel("vendorPartnerModelName");
						var partnerName = this.getView().byId("idFunct").getValue();
						var vendorId = this.getView().byId("idNumber").getValue();
						var filterByLifnr = new sap.ui.model.Filter({
							path: "Lifnr", // string
							operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
							value1: vendorId // object
						});
						var filterByParvw = new sap.ui.model.Filter({
							path: "Parvw", // string
							operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
							value1: partnerName // object
						});
						this.getOwnerComponent().getModel().read("/PartnerFunctionCheckSet", {
							filters: [filterByLifnr, filterByParvw],
							success: function (data, response) {
								var possibleToAdd = true;
								if (data.results[0].Vtext === "") {
									var newPartner = {
										results: []
									};
									var newPartnerObject = {
										"Parvw": oView.byId("idFunct").getValue(),
										"Name1": oView.byId("idName").getValue(),
										"Lifnr": oView.byId("idNumber").getValue(),
										"Vtext": oView.byId("idVendorName").getValue(),
										"selected": false
									};
									if (oView.byId("idPartnersTable").getItems().length > 0) {
										var partnrTable = oView.byId("idPartnersTable").getModel("vendorPartnerModelName").getData().results;
										for (var ptcLcv = 0; ptcLcv < partnrTable.length; ptcLcv++) {
											if (newPartnerObject.Parvw === partnrTable[ptcLcv].Parvw) {
												possibleToAdd = false;
											}
										}
										if (possibleToAdd) {
											partnerTableExistingModel.getData().results.push(newPartnerObject);
											newPartnerObject = {};
											partnerTableExistingModel.refresh();
											MessageToast.show(resourceBundle.getText("prntrAddedSuccessfully"));
											oView.byId("idItemSubSection").setVisible(true);
											oView.byId("idAddPartner").setVisible(false);
											oView.byId("idPartnersSubSection").setVisible(true);
											if (oView.byId("idPartnersTable").getColumns()[0].mAggregations.header.getSelected()) {
												oView.byId("idPartnersTable").getColumns()[0].mAggregations.header.setSelected(false);
											}
										} else {
											MessageBox.alert(newPartnerObject.Name1 + " " + "(" + newPartnerObject.Parvw + ")" + " " + resourceBundle.getText(
												"apprvngMngrAlrdyExists"));
											newPartnerObject = {};
											partnerTableExistingModel.refresh();
										}
									} else {
										newPartner.results.push(newPartnerObject);
										var newPartnerModel = new JSONModel(newPartner);
										_self.setModel(newPartnerModel, "vendorPartnerModelName");
										newPartnerObject = {};
										MessageToast.show(resourceBundle.getText("prntrAddedSuccessfully"));
										oView.byId("idItemSubSection").setVisible(true);
										oView.byId("idAddPartner").setVisible(false);
										oView.byId("idPartnersSubSection").setVisible(true);
										if (oView.byId("idPartnersTable").getColumns()[0].mAggregations.header.getSelected()) {
											oView.byId("idPartnersTable").getColumns()[0].mAggregations.header.setSelected(false);
										}
									}
								} else {
									MessageBox.error(data.results[0].Vtext);
								}
							},
							error: function () {}
						});
					} else {
						MessageBox.alert(resourceBundle.getText("plsSelectItmFrm"));
					}
				} else {
					MessageBox.alert(resourceBundle.getText("plsFillUp"));
				}

			}

		},
		connonInputFieldStateChange: function (oEvent) {
			var oView = this.getView();
			if ((oEvent.getSource().getId()).includes("idName")) {
				oView.byId("idName").setValueState("None");
			} else if ((oEvent.getSource().getId()).includes("idVendorName")) {
				oView.byId("idVendorName").setValueState("None");
			} else if ((oEvent.getSource().getId()).includes("idFunct")) {
				oView.byId("idFunct").setValueState("None");
			} else if ((oEvent.getSource().getId()).includes("idNumber")) {
				oView.byId("idNumber").setValueState("None");
			}
			var commValue2 = oEvent.getParameters().value;
			var $input = commValue2;
			if ($input) {
				oEvent.getSource().setValue($input);
			} else {
				oEvent.getSource().setDOMValue("");
			}
		},
		onPartnerCancel: function (oEvent) {
			var oView = this.getView();
			oView.byId("idItemSubSection").setVisible(true);
			oView.byId("idPartnersSubSection").setVisible(true);
			oView.byId("idAddNewItem").setVisible(false);
			oView.byId("idAddPartner").setVisible(false);
		},
		partnerTableSelectionChange: function (oEvent) {
			var oView = this.getView();
			this.partnerTableSelectedItemIndex = "";
			oView.byId("idAddPartnerButton").setVisible(false);
			oView.byId("idUpdatePartnerButton").setVisible(true);
			this.partnerTableSelectedItemIndex = oEvent.getSource().getSelectedContextPaths()[0].split("/")[2];
			var selectedRow = oView.byId("idPartnersTable").getModel("vendorPartnerModelName").getData().results[this.partnerTableSelectedItemIndex];
			oView.byId("idItemSubSection").setVisible(false);
			oView.byId("idAddNewItem").setVisible(false);
			oView.byId("idPartnersSubSection").setVisible(false);
			oView.byId("idAddPartner").setVisible(true);
			oView.byId("idFunct").setValue(selectedRow.Parvw);
			oView.byId("idName").setValue(selectedRow.Name1);
			oView.byId("idNumber").setValue(selectedRow.Lifnr);
			oView.byId("idVendorName").setValue(selectedRow.Vtext);
			oEvent.getSource().getSelectedItem().setSelected(false);
		},
		onUpdatePartner: function () {
			var _self = this;
			var oView = this.getView();
			var canBeProceed2 = true;
			var resourceBundle = this.getResourceBundle();
			var inputs = [
				oView.byId("idFunct"),
				// oView.byId("idName"),
				oView.byId("idNumber")
				// oView.byId("idVendorName")
			];
			jQuery.each(inputs, function (i, input) {
				if (input.getValue()) {
					input.setValueState("None");
				} else if (!input.getValue()) {
					input.setValueState("Error");
					canBeProceed2 = false;
				}
			});
			if (!canBeProceed2) {
				MessageBox.alert(resourceBundle.getText("plsFillUp"));
			} else {
				if (this.addPartnerMandtFldChk()) {
					if (this.addPartnerMandtFldChk2()) {
						var selectedPartnerIndexVal = this.partnerTableSelectedItemIndex;
						var partnerName = this.getView().byId("idFunct").getValue();
						var vendorId = this.getView().byId("idNumber").getValue();
						var filterByLifnr = new sap.ui.model.Filter({
							path: "Lifnr", // string
							operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
							value1: vendorId // object
						});
						var filterByParvw = new sap.ui.model.Filter({
							path: "Parvw", // string
							operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
							value1: partnerName // object
						});
						this.getOwnerComponent().getModel().read("/PartnerFunctionCheckSet", {
							filters: [filterByLifnr, filterByParvw],
							success: function (data, response) {
								if (data.results[0].Vtext === "") {
									var updatedPartnerRowObject = {
										"Parvw": oView.byId("idFunct").getValue(),
										"Name1": oView.byId("idName").getValue(),
										"Lifnr": oView.byId("idNumber").getValue(),
										"Vtext": oView.byId("idVendorName").getValue()
									};
									if (oView.byId("idPartnersTable").getColumns()[0].mAggregations.header.getSelected()) {
										oView.byId("idPartnersTable").getColumns()[0].mAggregations.header.setSelected(false);
									}
									oView.byId("idPartnersTable").getModel("vendorPartnerModelName").getData().results.splice(selectedPartnerIndexVal, 1);
									oView.byId("idPartnersTable").getModel("vendorPartnerModelName").getData().results.splice(selectedPartnerIndexVal, 0,
										updatedPartnerRowObject);
									var updatedPartnerTableModel = new JSONModel(oView.byId("idPartnersTable").getModel("vendorPartnerModelName").getData());
									_self.setModel(updatedPartnerTableModel, "vendorPartnerModelName");
									updatedPartnerRowObject = {};
									_self.partnerTableSelectedItemIndex = "";
									oView.byId("idItemSubSection").setVisible(true);
									oView.byId("idPartnersSubSection").setVisible(true);
									oView.byId("idAddNewItem").setVisible(false);
									oView.byId("idAddPartner").setVisible(false);
								} else {
									MessageBox.error(data.results[0].Vtext);
									oView.byId("idAddNewItem").setVisible(false);
								}
							},
							error: function (response) {}
						});
					} else {
						MessageBox.alert(resourceBundle.getText("plsSelectItmFrm"));
					}
				} else {
					MessageBox.alert(resourceBundle.getText("plsFillUp"));
				}
			}
		},
		selectPartnerAllRows: function (oEvent) {
			var partnerTableRecords = this.getView().byId("idPartnersTable");
			if (partnerTableRecords.getItems().length) {
				var partnerTableRecords2 = partnerTableRecords.getModel("vendorPartnerModelName").getData();
				if (oEvent.getSource().getParent().getParent().mAggregations.columns[0].getHeader().getSelected()) {
					for (var pLcv = 0; pLcv < partnerTableRecords2.results.length; pLcv++) {
						this.getView().byId("idPartnersTable").getItems()[pLcv].mAggregations.cells[0].setSelected(true);
					}
				} else {
					for (var pLcv2 = 0; pLcv2 < partnerTableRecords2.results.length; pLcv2++) {
						this.getView().byId("idPartnersTable").getItems()[pLcv2].mAggregations.cells[0].setSelected(false);
					}
				}
			}
		},
		selectPartnerSingleRow: function (oEvent) {
			var partnerTableLength = this.getView().byId("idPartnersTable").getItems();
			var allSelected2 = false;
			for (var sRLcv = 0; sRLcv < partnerTableLength.length; sRLcv++) {
				if (this.getView().byId("idPartnersTable").getItems()[sRLcv].mAggregations.cells[0].getSelected()) {
					allSelected2 = true;
				} else {
					allSelected2 = false;
					break;
				}
			}
			if (allSelected2) {
				oEvent.getSource().getParent().getParent().mAggregations.columns[0].getHeader().setSelected(true);
			} else {
				oEvent.getSource().getParent().getParent().mAggregations.columns[0].getHeader().setSelected(false);
			}
		},
		onDeletePartner: function (oEvent) {
			var checkedItems = true;
			var colDelItems = [];
			var oView = this.getView();
			var resourceBundle = this.getResourceBundle();
			var partnerTable = oView.byId("idPartnersTable");
			var partnerTableData = "";
			var partnerTableModel = "";
			if (partnerTable.getItems().length) {
				partnerTableModel = partnerTable.getModel("vendorPartnerModelName");
				partnerTableData = partnerTable.getModel("vendorPartnerModelName").getData().results;
				for (var ditLcv = 0; ditLcv < partnerTableData.length; ditLcv++) {
					if (partnerTableData[ditLcv].selected) {
						colDelItems.push(partnerTableData[ditLcv]);
					}
				}
				if (colDelItems.length) {
					for (var sILcv2 = (partnerTableData.length - 1); sILcv2 >= 0; sILcv2--) {
						if (partnerTableData[sILcv2].selected) {
							partnerTableData.splice(sILcv2, 1);
						}
					}
					oView.byId("idPartnersTable").mAggregations.columns[0].getHeader().setSelected(false);
					partnerTableModel.refresh();
				} else {
					MessageBox.alert(resourceBundle.getText("plsSelctRecdsFrmTbl"));
				}
			} else {
				MessageBox.alert(resourceBundle.getText("plsAddrcrdToTbl"));
			}
		},
		AccAssgnmntSelectionChange: function (oEvent) {
			var oView = this.getView();
			oView.byId("idAccAGnmnt").setValueState("None");
			if (oEvent.getSource().getSelectedItem().getKey() === "F") {
				oView.byId("idGbsLbl").setVisible(false);
				oView.byId("idGbs").setVisible(false);
				oView.byId("idGbsTxt").setVisible(false);
				oView.byId("idGbs").setValueState("None");
				if (oView.byId("idGbs").getValue()) {
					oView.byId("idGbs").setValue("");
				}
				if (oView.byId("idCstCntre").getValue()) {
					oView.byId("idCstCntre").setValue("");
				}
				oView.byId("idOrdLbl").setVisible(true);
				oView.byId("idOrdrTxt").setVisible(true);
				oView.byId("idOrdr").setVisible(true);
				oView.byId("idOrdLbl").setRequired(true);
				oView.byId("idCstCntreLbl").setVisible(false);
				oView.byId("idCstCntreTxt").setVisible(false);
				oView.byId("idCstCntre").setVisible(false);
				oView.byId("idCstCntre").setValueState("None");
			} else if (oEvent.getSource().getSelectedItem().getKey() === "K") {
				oView.byId("idOrdLbl").setVisible(true);
				oView.byId("idOrdr").setVisible(true);
				oView.byId("idOrdrTxt").setVisible(true);
				oView.byId("idOrdLbl").setRequired(false);
				oView.byId("idOrdr").setValueState("None");
				if (oView.byId("idOrdr").getValue()) {
					oView.byId("idOrdr").setValue("");
				}
				oView.byId("idGbsLbl").setVisible(false);
				oView.byId("idGbsTxt").setVisible(false);
				oView.byId("idGbs").setVisible(false);
				oView.byId("idGbs").setValueState("None");
				if (oView.byId("idGbs").getValue()) {
					oView.byId("idGbs").setValue("");
				}
				oView.byId("idCstCntreLbl").setVisible(true);
				oView.byId("idCstCntreTxt").setVisible(true);
				oView.byId("idCstCntre").setVisible(true);
			} else {
				oView.byId("idOrdLbl").setVisible(false);
				oView.byId("idOrdrTxt").setVisible(false);
				oView.byId("idOrdr").setVisible(false);
				oView.byId("idOrdLbl").setRequired(false);
				oView.byId("idOrdr").setValueState("None");
				if (oView.byId("idOrdr").getValue()) {
					oView.byId("idOrdr").setValue("");
				}
				oView.byId("idCstCntreLbl").setVisible(false);
				oView.byId("idCstCntreTxt").setVisible(false);
				oView.byId("idCstCntre").setVisible(false);
				oView.byId("idCstCntre").setValueState("None");
				if (oView.byId("idCstCntre").getValue()) {
					oView.byId("idCstCntre").setValue("");
				}
				oView.byId("idGbsLbl").setVisible(true);
				oView.byId("idGbsTxt").setVisible(true);
				oView.byId("idGbs").setVisible(true);
			}
		},
		shrtTxtLiveChnge: function (oEvent) {
			var oView = this.getView();
			oView.byId("idShrtTxt").setValueState("None");
			var stValue = oEvent.getParameters().value;
			var $input = stValue;
			if ($input) {
				// var $valid = (this.$validExpr) ? this.$validExpr.input : '';
				oEvent.getSource().setValue($input);
			} else {
				oEvent.getSource().setDOMValue("");
			}
		},
		purchOrgSelChnge: function (oEvent) {
			var frgmntView = sap.ui.getCore();
			var xmlView = this.getView();
			frgmntView.byId(oEvent.getSource().getId()).setValueState("None");

			//********Start of Update newly selected currency.*************//
			if (oEvent.getSource().getId() === "idCurrency") {
				if (xmlView.byId("idItemsTable").getItems()) {
					for (var dcLcv = 0; dcLcv < xmlView.byId("idItemsTable").getItems().length; dcLcv++) {
						var price = xmlView.byId("idItemsTable").getItems()[dcLcv].mAggregations.cells[6].getText().split(" ")[0];
						var currPrice = price + " " + oEvent.getSource().getSelectedItem().getKey();
						xmlView.byId("idItemsTable").getItems()[dcLcv].mAggregations.cells[6].setText(currPrice);
					}
					currencyDependingOnVendor = [];
					currencyDependingOnVendor.push(oEvent.getSource().getSelectedItem().getKey());
					var poNetValueFinal = parseFloat(xmlView.byId("idPoNetValue").getText()).toFixed(2) + " " + oEvent.getSource().getSelectedItem().getKey();
					xmlView.byId("idPoNetValue").setText(poNetValueFinal);
				}
			}
			//********End of Update newly selected currency.*************//
		},
		purchGrpSelChnge: function (oEvent) {},
		currencySelChnge: function (oEvent) {},
		compCodeSelChnge: function (oEvent) {},
		onPersonalSettingsDialogAdd: function (oEvent) {
			var _self = this;
			var oView = sap.ui.getCore();
			var oView2 = this.getView();
			var oModel = this.getOwnerComponent().getModel();
			var canContinue = true;
			var resourceBundle = this.getResourceBundle();
			var inputs = [
				oView.byId("idPurchOrg"),
				oView.byId("idPurchGrp"),
				// oView.byId("idCurrency"),
				oView.byId("idCompCode")
			];
			jQuery.each(inputs, function (i, input) {
				if (input.getValue()) {
					input.setValueState("None");
				} else if (!input.getValue()) {
					input.setValueState("Error");
					canContinue = false;
				}
			});
			if (!canContinue) {
				MessageBox.alert(resourceBundle.getText("plsFillUp"));
			} else {
				var finalItems = [];
				var finalItemsHeadetText = [];
				var payLoad = {
					"PerSetHdToItmNav": {
						"results": []
					}
				};
				var BUKRS = oView.byId("idCompCode").getSelectedItem().getKey();
				var EKGRP = oView.byId("idPurchGrp").getSelectedItem().getKey();
				var EKORG = oView.byId("idPurchOrg").getSelectedItem().getKey();
				var HeaderText = oView2.byId("idTextArea").getValue();
				var purchOrg = {
					"Element": "POHeaderProposer    EKORG",
					"Active": EKORG
				};
				finalItems.push(purchOrg);
				var purchGrp = {
					"Element": "POHeaderProposer    EKGRP",
					"Active": EKGRP
				};
				finalItems.push(purchGrp);
				var compCode = {
					"Element": "POHeaderProposer    BUKRS",
					"Active": BUKRS
				};
				finalItems.push(compCode);
				finalItemsHeadetText.push(HeaderText);
				sap.ui.core.BusyIndicator.show();
				payLoad.Uname = userName;
				payLoad.Action = resourceBundle.getText("prchsOrdr");
				for (var plLcv = 0; plLcv < finalItems.length; plLcv++) {
					payLoad.PerSetHdToItmNav.results.push(finalItems[plLcv]);
				}
				copiedPersonalSettingsItems2 = jQuery.extend(true, {}, payLoad);
				copiedPersonalSettingsItems = "";
				copiedHeaderText = jQuery.extend(true, {}, finalItemsHeadetText);
				oModel.create("/PersonalSettingsHeadSet", payLoad, {
					success: function (data, response) {
						sap.ui.core.BusyIndicator.hide();
						_self.openPersonalSettingsDialog().close();
					},
					error: function (response) {
						sap.ui.core.BusyIndicator.hide();
					}
				});
			}
		},

		onVendorDialogClose: function (oEvent) {
			MessageToast.show("No new item was selected.");
			oEvent.getSource().getBinding("items").filter([]);
		},
		vendorSelectionChange: function (oEvent) {
			var selectedVendorName = oEvent.getSource().getSelectedItem().getKey();
			var vendorModelItems = oEvent.getSource().getModel("VendorListModelName").getData();
			var vendorModelLength = vendorModelItems.results.length;
			for (var vmLcv = 0; vmLcv < vendorModelLength; vmLcv++) {
				if (selectedVendorName === vendorModelItems.results[vmLcv].Lifnr) {
					this.getView().byId("idVendorName").setValue(vendorModelItems.results[vmLcv].Name1);
				}
			}
			this.getView().byId("idNumber").setValueState("None");
			this.getView().byId("idVendorName").setValueState("None");
		},
		partnerSelectionChange: function (oEvent) {
			var selectedParner = oEvent.getSource().getSelectedItem().getKey();
			var partnetModelItems = oEvent.getSource().getModel("PartnerFunctionModelName").getData();
			var partnetModelLength = partnetModelItems.results.length;
			for (var pmLcv = 0; pmLcv < partnetModelLength; pmLcv++) {
				if (selectedParner === partnetModelItems.results[pmLcv].Parvw) {
					this.getView().byId("idName").setValue(partnetModelItems.results[pmLcv].Vtext);
				}
			}
		},
		itemFieldValidation: function (oEvent) {
			var itmValue = oEvent.getParameters().value;
			var numbers = /^[0-9]{1,5}$/;
			var $input = itmValue;
			var validExpr = $input.match(numbers);
			if (validExpr) {
				this.$validExpr = validExpr;
			}
			if (!validExpr) {
				if ($input) {
					var $valid = (this.$validExpr) ? this.$validExpr.input : '';
					oEvent.getSource().setValue($valid);
				}
				return false;
			} else {
				if ($input) {
					var $valid = (this.$validExpr) ? this.$validExpr.input : '';
					oEvent.getSource().setValue($valid);
					this.getView().byId("idItem").setValueState("None");
				} else {
					oEvent.getSource().setDOMValue("");
				}
				return false;
			}

		},
		poQutyValidationCheck: function (oEvent) {
			var qtyValue = oEvent.getParameters().value;
			var numbers = /^\d{0,13}(\.\d{0,3})?$/;
			var $input = qtyValue;
			if ($input) {
				$input = $input.replace(',', '.');
				oEvent.getSource().setValue($input);
			}
			var validExpr = $input.match(numbers);
			if (validExpr) {
				this.$validExpr = validExpr;
			}
			if (!validExpr) {
				if ($input) {
					var $valid = (this.$validExpr) ? this.$validExpr.input : '';
					oEvent.getSource().setValue($valid);
				}
				return false;
			} else {
				if ($input) {
					var $valid = (this.$validExpr) ? this.$validExpr.input : '';
					oEvent.getSource().setValue($valid);
					this.getView().byId("idPoQty").setValueState("None");
				} else {
					oEvent.getSource().setDOMValue("");
				}
				return false;
			}
		},
		commonSelectionChange: function (oEvent) {
			var fieldId = oEvent.getSource().getId();
			var oView = this.getView();
			// oView.byId("fieldId").setValueState("None");
			if (fieldId.includes("idOun")) {
				oView.byId("idOun").setValueState("None");
			} else if (fieldId.includes("idMtrlGrp")) {
				oView.byId("idMtrlGrp").setValueState("None");
			} else if (fieldId.includes("idGlAcc")) {
				oView.byId("idGlAcc").setValueState("None");
			} else if (fieldId.includes("idCstCntre")) {
				oView.byId("idCstCntre").setValueState("None");
			} else if (fieldId.includes("idOrdr")) {
				oView.byId("idOrdr").setValueState("None");
			} else if (fieldId.includes("idGbs")) {
				oView.byId("idGbs").setValueState("None");
			} else if (fieldId.includes("idFunct")) {
				oView.byId("idFunct").setValueState("None");
			}
		},
		netPriceValidation: function (oEvent) {
			var ntPriceVal = oEvent.getParameters().value;
			var numbers = /^\d{0,11}(\.\d{0,2})?$/;
			var $input = ntPriceVal;
			if ($input) {
				$input = $input.replace(',', '.');
				oEvent.getSource().setValue($input);
			}
			var validExpr = $input.match(numbers);
			if (validExpr) {
				this.$validExpr = validExpr;
			}
			if (!validExpr) {
				if ($input) {
					var $valid = (this.$validExpr) ? this.$validExpr.input : '';
					oEvent.getSource().setValue($valid);
				}
				return false;
			} else {
				if ($input) {
					var $valid = (this.$validExpr) ? this.$validExpr.input : '';
					oEvent.getSource().setValue($valid);
					this.getView().byId("idNetPrice").setValueState("None");
				} else {
					oEvent.getSource().setDOMValue("");
				}
				return false;
			}
		},
		delvDateChange: function (oEvent) {
			setTimeout(function () {
				$(".dateInputHide").find("input").attr("readonly", true);
			}, 200);
			var selectedDate = oEvent.getSource().getDateValue();
			var oView = this.getView();
			var dt = new Date(selectedDate);
			var dateInst = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd/MM/yyyy"
			});
			var fnlDate = dateInst.format(dt);
			oView.byId("idDelvDt").setValue(fnlDate);
			oView.byId("idDelvDt").setValueState("None");
		},
		getPersonalSettingsItems: function (item) {
			var finalLength = "";
			if (copiedPersonalSettingsItems) {
				for (var psiLcv = 0; psiLcv < copiedPersonalSettingsItems.results.length; psiLcv++) {
					if ((copiedPersonalSettingsItems.results[psiLcv].Element).includes(item.toUpperCase())) {
						return copiedPersonalSettingsItems.results[psiLcv].Active;
						break;
					}
				}
			} else if (copiedPersonalSettingsItems2) {
				for (var psiLcv2 = 0; psiLcv2 < copiedPersonalSettingsItems2.PerSetHdToItmNav.results.length; psiLcv2++) {
					if ((copiedPersonalSettingsItems2.PerSetHdToItmNav.results[psiLcv2].Element).includes(item.toUpperCase())) {
						return copiedPersonalSettingsItems2.PerSetHdToItmNav.results[psiLcv2].Active;
						break;
					}
				}
			}
		},
		formatDate: function (dateValue) {
			var formattedDate = dateValue.split("/")[2] + dateValue.split("/")[1] + dateValue.split("/")[0];
			return formattedDate;
		},
		onCheckPress: function (oEvent) {
			var Tflag = 'X';
			this.handleSubmitPress(Tflag);
		},
		onCancelPress: function (oEvent) {
			var oView = this.getView();
			oView.byId("idVendor").setValue("");
			oView.byId("idDocDate").setValue("");
			var todaysDate = this.formattingDate(new Date());
			oView.byId("idDocDate").setValue(todaysDate);
			oView.byId("idPoNetValue").setText("");
			if (oView.byId("idItemsTable").getItems().length) {
				oView.byId("idItemsTable").getModel("itemTableModelName").setData([]);
				oView.byId("idItemsTable").getModel("itemTableModelName").refresh();
			}
			if (oView.byId("idPartnersTable").getItems().length) {
				oView.byId("idPartnersTable").getModel("vendorPartnerModelName").setData([]);
				oView.byId("idPartnersTable").getModel("vendorPartnerModelName").refresh();
			}
			oView.byId("idItem").setValue("");
			oView.byId("idAccAGnmnt").setValue("");
			oView.byId("idShrtTxt").setValue("");
			oView.byId("idPoQty").setValue("");
			oView.byId("idOun").setValue("");
			oView.byId("idNetPrice").setValue("");
			oView.byId("idDelvDt").setValue("");
			oView.byId("idMtrlGrp").setValue("");
			oView.byId("idGlAcc").setValue("");
			oView.byId("idCstCntre").setValue("");
			oView.byId("idOrdr").setValue("");
			oView.byId("idGbs").setValue("");
			oView.byId("idFunct").setValue("");
			oView.byId("idName").setValue("");
			oView.byId("idNumber").setValue("");
			oView.byId("idVendorName").setValue("");
			oView.byId("idApproverName").setValue("");
			oView.byId("idTextArea").setValue("");
			oView.byId("idAddNewItem").setVisible(false);
			oView.byId("idAddPartner").setVisible(false);
			var itemsTableRecords = this.getView().byId("idItemsTable");
			itemsTableRecords.mAggregations.columns[0].getHeader().setSelected(false);
			var partnersTableRecords = this.getView().byId("idPartnersTable");
			partnersTableRecords.mAggregations.columns[0].getHeader().setSelected(false);
			oView.byId("idItemSubSection").setVisible(true);
            oView.byId("idPartnersSubSection").setVisible(true);
			itemCount = 0;
		},
		checkHeaderText: function (hdrTxtVal) {
			if (hdrTxtVal) {
				return hdrTxtVal;
			} else {
				return "";
			}
		},
		splitItems: function (sVal) {
			if (sVal.includes("(") && sVal.includes(")")) {
				return sVal.split("(")[1].split(")")[0];
			} else {
				return sVal;
			}
		},
		splitAndTrim: function (sVal2) {
			if (sVal2.includes("(") && sVal2.includes(")")) {
				return sVal2.split("(")[0].trim();
			} else {
				return sVal2;
			}
		},
		mandtFldValidationCheck: function () {
			var oView = this.getView();
			var canProceedFinal = true;
			var resourceBundle = this.getResourceBundle();
			var selectedAccAssCatgry = "";
			if (oView.byId("idAccAGnmnt").getSelectedItem()) {
				selectedAccAssCatgry = oView.byId("idAccAGnmnt").getSelectedItem().getKey();
			} else {
				selectedAccAssCatgry = oView.byId("idAccAGnmnt").getValue().split("(")[0].trim();
			}
			var inputs = [];
			if (selectedAccAssCatgry === "K") {
				inputs.push(oView.byId("idAccAGnmnt"));
				inputs.push(oView.byId("idOun"));
				inputs.push(oView.byId("idMtrlGrp"));
				inputs.push(oView.byId("idGlAcc"));
				inputs.push(oView.byId("idCstCntre"));
				if (oView.byId("idOrdr").getValue()) {
					inputs.push(oView.byId("idOrdr"));
				}
				inputs.push(oView.byId("idGbs"));
			} else {
				inputs.push(oView.byId("idAccAGnmnt"));
				inputs.push(oView.byId("idOun"));
				inputs.push(oView.byId("idMtrlGrp"));
				inputs.push(oView.byId("idGlAcc"));
				inputs.push(oView.byId("idCstCntre"));
				inputs.push(oView.byId("idOrdr"));
				inputs.push(oView.byId("idGbs"));
			}
			jQuery.each(inputs, function (i, input) {
				if (input.getValue().includes("(") && input.getValue().includes(")") && input.getProperty("visible")) {
					input.setValueState("None");
				} else if (!input.getValue().includes("(") && !input.getValue().includes(")") && input.getProperty("visible")) {
					input.setValueState("Error");
					canProceedFinal = false;
				}
			});
			return canProceedFinal;
		},
		onFunctnValueHelpRequest: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var resourceBundle = this.getResourceBundle();
			this.selectVendorDialog = new sap.m.SelectDialog({
				title: resourceBundle.getText("slctPrtnr"),
				items: {
					path: "/PartnerFunctionSet",
					template: new sap.m.StandardListItem({
						title: "{Vtext}",
						description: "{Parvw}"
					})
				},
				search: [
					this.onFunctnSearch, this
				],
				confirm: [this.onFunctnSelection,
					this
				],
				cancel: [this.onVendorDialogClose,
					this
				]
			});
			this.selectVendorDialog.setModel(oModel);
			this.selectVendorDialog.open();
		},
		onFunctnSelection: function (oEvent) {
			var oInput = this.byId("idFunct");
			var oInput2 = this.byId("idName");
			var oResourceBundle = this.getResourceBundle();
			var aContexts = "";
			var _that = this;
			var selectedFunctn = "";
			var selectedFunctnText = "";
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getDescription();
				aContexts = oEvent.getParameter("selectedContexts");
				aContexts.map(function (oContext) {
					selectedFunctn = oContext.getObject().Parvw;
					selectedFunctnText = oContext.getObject().Vtext;
				});
				oInput.setValueState("None");
				oInput2.setValueState("None");
				oInput.setValue(selectedFunctn);
				oInput2.setValue(selectedFunctnText);
			} else {
				selectedFunctn = oEvent.getSource().getProperty("value");
				var filterByParvw = new sap.ui.model.Filter({
					path: "Parvw", // string
					operator: sap.ui.model.FilterOperator.EQ, // sap.ui.model.FilterOperator
					value1: selectedFunctn // object
				});
				this.getOwnerComponent().getModel().read("/PartnerFunctionSet", {
					filters: [filterByParvw],
					success: function (data, response) {
						if (!(data.results.length)) {
							MessageBox.alert(oResourceBundle.getText("noFuncAvlbl") + " " + "(" + selectedFunctn + ")");
						}
						oInput.setValueState("None");
						oInput2.setValueState("None");
						_that.getView().byId("idFunct").setValue(data.results[0].Parvw);
						_that.getView().byId("idName").setValue(data.results[0].Vtext);
					},
					error: function (response) {}
				});
			}
			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},
		handleChange: function (oEvent) {
			setTimeout(function () {
				$(".dateInputHide").find("input").attr("readonly", true);
			}, 200);
			var selectedDateValue = oEvent.getSource().getDateValue();
			var d = new Date(selectedDateValue);
			var dateInst = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd/MM/yyyy"
			});
			var fnlDate = dateInst.format(d);
			this.getView().byId("idDocDate").setValue(fnlDate);
		},
		// commChange2: function (oEvent) {
		// },
		//*****************************************RETPO Check and UnCheck**************************************************//
		retPOCheckUncheck: function (oEvent) {
			var oResourceBundle = this.getResourceBundle();
			var oView = this.getView();
			var canContinue = true;
			var commArray = [];
			var finalPoNetValue = "";
			var inputs = [
				oView.byId("idPoQty"),
				oView.byId("idNetPrice")
			];
			jQuery.each(inputs, function (i, input) {
				if (input.getValue()) {
					input.setValueState("None");
				} else if (!input.getValue()) {
					if (input.getId().includes("idPoQty")) {
						commArray.push("idPoQty");
					} else if (input.getId().includes("idNetPrice")) {
						commArray.push("idNetPrice");
					}
					input.setValueState("Error");
					canContinue = false;
				}
			});
			if (!canContinue) {
				oEvent.getSource().setSelected(false);
				if (commArray.length > 1) {
					MessageBox.alert(oResourceBundle.getText("plsFillupPoQtyAndNetPrice"));

				} else {
					for (var caLcv = 0; caLcv < commArray.length; caLcv++) {
						if (commArray[caLcv] === "idPoQty") {
							MessageBox.alert(oResourceBundle.getText("plsFillupPoQtyy"));
						} else if (commArray[caLcv] === "idNetPrice") {
							MessageBox.alert(oResourceBundle.getText("plsFillupNetPrice"));
						}
					}
				}
			}
		},
		//*****************************************END OF RETPO Check and UnCheck**************************************************//
		//*****************************************PartnerLiveChange************************************************************//
		partnerLiveChange: function (oEvent) {
			var _self = this;
			var resourceBundle = this.getResourceBundle();
			var selectedFunction = this.getView().byId("idFunct").getValue();
			var oFilter = "";
			var filters = [];
			var selectedValue = this.getView().byId("idNumber").getValue();
			if (selectedFunction && selectedValue.length > 2) {
				oFilter = new Filter({
					filters: [
						new Filter({
							path: 'Lifnr',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: selectedValue
						}),
						new Filter({
							path: 'Name1',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: selectedValue
						})
					],
					and: true
				});
				var sFilter = new Filter({
					path: 'Parvw',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: selectedFunction
				});
				oFilter.aFilters.push(sFilter);
				filters.push(oFilter);

				this.getOwnerComponent().getModel().read("/PersonVendorListSet", {
					filters: filters,
					success: function (data) {
						var personVendorModel = new JSONModel(data);
						_self.setModel(personVendorModel, "personVendorModelName");
					},
					error: function (response) {}
				});

			} else {
				if (selectedValue.length > 2) {
					oFilter = new Filter({
						filters: [
							new Filter({
								path: 'Lifnr',
								operator: sap.ui.model.FilterOperator.Contains,
								value1: selectedValue
							}),
							new Filter({
								path: 'Name1',
								operator: sap.ui.model.FilterOperator.Contains,
								value1: selectedValue
							}),
							new Filter({
								path: 'Parvw',
								operator: sap.ui.model.FilterOperator.Contains,
								value1: selectedValue
							})
						],
						and: true
					});
					filters.push(oFilter);

					this.getOwnerComponent().getModel().read("/PersonVendorListSet", {
						filters: filters,
						success: function (data) {
							var personVendorModel = new JSONModel(data);
							_self.setModel(personVendorModel, "personVendorModelName");
						},
						error: function (response) {}
					});

				}
			}

		},
		suggestionPartnerItemSelected: function (oEvent) {
			var oInput = this.byId("idVendorName");
			var oInput2 = this.byId("idNumber");
			var oResourceBundle = this.getResourceBundle();
			var selectedVendorId = "";
			var selectedVendorName = "";
			if (oEvent.getParameter("selectedItem")) {
				selectedVendorId = oEvent.getParameter("selectedItem").getText().split("(")[1].split(")")[0];
				selectedVendorName = oEvent.getParameter("selectedItem").getText().split("(")[0].trim();
				oInput.setValueState("None");
				oInput2.setValueState("None");
				oInput.setValue(selectedVendorName);
				oInput2.setValue(selectedVendorId);
			}
		},
		//*****************************************Create PO********************************************************************//		
		handleSubmitPress: function (flagValue) {
			var _that = this;
			var partnerItemSelected = true;
			var itemTableItemSelected = true;
			var oView = this.getView();
			var selectedVendor = oView.byId("idVendor").getValue();
			var documentDate = oView.byId("idDocDate").getValue();
			var oModel = this.getOwnerComponent().getModel();
			var oResourceBundle = this.getResourceBundle();
			var itemTable = oView.byId("idItemsTable");
			var itemTableModel = "";
			var itemTableRecords = "";
			var partnerTable = oView.byId("idPartnersTable");
			var partnerTableModel = "";
			var partnerTableRecords = "";
			var HeadToPartnerNavObj = {};
			var HeadToItemNavObj = {};
			var payLoadToCreatePO = {
				"HeadToPartnerNav": {
					"results": []
				},
				"HeadToItemNav": {
					"results": []
				}
			};
			if (selectedVendor) {
				if (documentDate) {
					if (itemTable.getItems().length) {
						itemTableModel = itemTable.getModel("itemTableModelName");
						itemTableRecords = itemTableModel.getData().results;
						if (partnerTable.getItems().length) {
							partnerTableModel = partnerTable.getModel("vendorPartnerModelName");
							partnerTableRecords = partnerTableModel.getData().results;
						}
						payLoadToCreatePO.Bsart = "ZB";
						payLoadToCreatePO.Lifnr = this.splitItems(oView.byId("idVendor").getValue());
						payLoadToCreatePO.Bedat = this.formatDate(oView.byId("idDocDate").getValue());
						payLoadToCreatePO.Ekorg = this.getPersonalSettingsItems("Ekorg");
						payLoadToCreatePO.Ekgrp = this.getPersonalSettingsItems("Ekgrp");
						payLoadToCreatePO.Bukrs = this.getPersonalSettingsItems("Bukrs");
						// payLoadToCreatePO.Waers = this.getPersonalSettingsItems("Waers");
						if (currencyDependingOnVendor.length) {
							payLoadToCreatePO.Waers = currencyDependingOnVendor[0];
						} else {
							payLoadToCreatePO.Waers = "";
						}
						payLoadToCreatePO.Tflag = "";
						payLoadToCreatePO.Tdline = oView.byId("idTextArea").getValue();
						if (flagValue === 'X') {
							payLoadToCreatePO.Tflag = flagValue;
						} else {
							payLoadToCreatePO.Tflag = "";
						}
						if (itemTable.getItems.length) {
							for (var itmLcv = 0; itmLcv < itemTableRecords.length; itmLcv++) {
								HeadToItemNavObj.Ebelp = (itemTableRecords[itmLcv].Item).toString();
								HeadToItemNavObj.Knttp = this.splitAndTrim(itemTableRecords[itmLcv].AccAssgmt);
								HeadToItemNavObj.Txz01 = itemTableRecords[itmLcv].ShortText;
								HeadToItemNavObj.Menge = itemTableRecords[itmLcv].POQty.split(" ")[0];
								HeadToItemNavObj.Meins = this.splitItems(itemTableRecords[itmLcv].OUn);
								HeadToItemNavObj.Netpr = itemTableRecords[itmLcv].NetPrice.split(" ")[0];
								HeadToItemNavObj.Eeind = this.formatDate(itemTableRecords[itmLcv].DelivDate);
								HeadToItemNavObj.Matkl = this.splitItems(itemTableRecords[itmLcv].MatlGroup);
								HeadToItemNavObj.Sakto = this.splitItems(itemTableRecords[itmLcv].GL);
								if (itemTableRecords[itmLcv].Order) {
									HeadToItemNavObj.Aufnr = this.splitItems(itemTableRecords[itmLcv].Order);
									HeadToItemNavObj.Kostl = this.splitItems(itemTableRecords[itmLcv].CostCenter);
								} else if (itemTableRecords[itmLcv].CostCenter) {
									HeadToItemNavObj.Kostl = this.splitItems(itemTableRecords[itmLcv].CostCenter);
								} else if (itemTableRecords[itmLcv].Gbs) {
									HeadToItemNavObj.PsPosid = itemTableRecords[itmLcv].Gbs.split("(")[1].split(")")[0];
								}

								if (itemTableRecords[itmLcv].RETPO) {
									HeadToItemNavObj.Retpo = "X";
								} else {
									HeadToItemNavObj.Retpo = "";
								}

								payLoadToCreatePO.HeadToItemNav.results.push(HeadToItemNavObj);
								HeadToItemNavObj = {};
							}
						}
						if (partnerTable.getItems().length) {
							for (var prtnarLcv = 0; prtnarLcv < checkPartner.length; prtnarLcv++) {
								for (var prtnrLcv = (partnerTableRecords.length - 1); prtnrLcv >= 0; prtnrLcv--) {
									if (checkPartner[prtnarLcv].Parvw === partnerTableRecords[prtnrLcv].Parvw) {
										partnerTableRecords.splice(prtnrLcv, 1);
									}
								}
							}
							if (partnerTableRecords.length) {
								for (var prtnarLcv2 = 0; prtnarLcv2 < partnerTableRecords.length; prtnarLcv2++) {
									HeadToPartnerNavObj.Parvw = partnerTableRecords[prtnarLcv2].Parvw;
									HeadToPartnerNavObj.Lifnr = partnerTableRecords[prtnarLcv2].Lifnr;
									payLoadToCreatePO.HeadToPartnerNav.results.push(HeadToPartnerNavObj);
									HeadToPartnerNavObj = {};
								}
							}
						}
						sap.ui.core.BusyIndicator.show();
						oModel.create("/POHeader101Set", payLoadToCreatePO, {
							success: function (data, response) {
								sap.ui.core.BusyIndicator.hide();
								if (data.Approver) {
									_that.getView().byId("idApproverName").setValue(data.Approver);
									for (var cpLcv = 0; cpLcv < checkPartner.length; cpLcv++) {
										partnerTableModel.getData().results.unshift(checkPartner[cpLcv]);
									}
								} else {
									MessageBox.success(oResourceBundle.getText("prchsOrdr2") + " " + data.Ebeln);
									_that.onCancelPress();
								}
							},
							error: function (response) {
								sap.ui.core.BusyIndicator.hide();
								var resourceModel = _that.getView().getModel("i18n");
								var bCompact = !!_that.getView().$().closest(".sapUiSizeCompact").length;
								var errorMessage = JSON.parse(response.responseText).error.innererror.errordetails;
								if (errorMessage.length) {
									new ErrorMessageController().handle(errorMessage, resourceModel, bCompact);
								}
							}
						});
					} else {
						MessageBox.alert(oResourceBundle.getText("plsAddRecrdToItmTbl"));
					}
				} else {
					MessageBox.alert(oResourceBundle.getText("docDateMsg"));
				}
			} else {
				MessageBox.alert(oResourceBundle.getText("vndrSelAlrtMsg"));
			}
		}

	});
});