sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		setOnlyNumber: function (sValue) {

		},
		dateFormatter: function (dateValue) {
			if (dateValue) {
				var d = new Date(dateValue);
				var dateInst = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "MM/dd/yyyy"
				});
				var DateV = dateInst.format(d);
				return DateV;
			}
		}

	};

});