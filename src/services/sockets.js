class PseudoSockets {

	static async initialize(){
		return console.log('PseudoSockets initializing');
	}

	static async close(){
		return console.log('PseudoSockets close');
	}

	static async sendEvent(event, payload, origin){
		return console.log('PseudoSockets sendEvent');
	}

	static async broadcastEvent(event, payload){
		return console.log('PseudoSockets broadcastEvent');
	}

	static async emit(origin, id, path, data){
		return console.log('PseudoSockets emit');
	}

	static async getNewKey(origin, id){
		return console.log('PseudoSockets getNewKey');
	}
}

module.exports = PseudoSockets;
