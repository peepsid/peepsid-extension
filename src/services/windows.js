const {getHost} = require("../util/getHost");

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

	static async openPopOut(popout){
		const {width, height} = popout.dimensions;

		let resolver;
		const promise = new Promise(resolve => resolver = resolve);

		const win = await this.getWindow(`${getHost()}/#/popout?extension=${popout.id}`, width, height);

		return {promise, resolver, win};
	}
}

module.exports = LowLevelWindowService;
