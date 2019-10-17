const {LocalStream} = require('extension-streams');
const ApiActions = require("@walletpack/core/models/api/ApiActions");
const wallet = require('./wallet');

let popouts = [];

let waitingPopup;
class LowLevelWindowService {

	static async getWindow(url, width = 800, height = 600){
		let middleX = window.screen.availWidth/2 - (width/2);
		let middleY = window.screen.availHeight/2 - (height/2);

		return window.open(url, 'ScatterPrompt', `width=${width},height=${height},resizable=0,top=${middleY},left=${middleX}`); //,titlebar=0
	}

	static dimensions(popup){
		switch (popup.data.type) {
			case ApiActions.LOGIN:
			case ApiActions.LOGIN_ALL:
			case ApiActions.GET_PUBLIC_KEY:
			case ApiActions.TRANSFER:
				return {width:600, height:600};
			case ApiActions.UPDATE_IDENTITY:
				return {width:420, height:600};
			case ApiActions.SIGN:
				return {width:920, height:600};
			case 'linkApp':
				return {width:420, height:500};
			default:
				return {width:800, height:600};
		}
	}

	static async openPopOut(popout){
		const {width, height} = LowLevelWindowService.dimensions(popout);

		let resolver;
		const promise = new Promise(resolve => resolver = resolve);

		const win = await this.getWindow(`${process.env.WEB_HOST}/#/popout?extension=${popout.id}`, width, height);

		return {promise, resolver, win};
	}
}

module.exports = LowLevelWindowService;
