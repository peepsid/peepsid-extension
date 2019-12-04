import {EncryptedStream} from 'extension-streams';
import IdGenerator from '@walletpack/core/util/IdGenerator';
import {getHost} from "./util/getHost";

let resolvers = {};
class Inject {

	constructor(){
		const stream = new EncryptedStream('injected', IdGenerator.text(64));

		stream.listenWith(async data => {
			if(data.type === 'synced' || data.type === 'sync') return;
			if(data.type === 'socket') {
				const result = await window.wallet.socketResponse({type:'ext_api', request:data.payload});
				stream.send({type:'apiResponse', result}, 'scatter')
				return result;
			}
			if(!resolvers[data.id]) return;
			resolvers[data.id].resolve(data.result);
			delete resolvers[data.id];
		});

		stream.sync('scatter', stream.key);


		const proxyGet = (prop, target, key) => {
			if (key === 'then') {
				return (prop ? target[prop] : target).then.bind(target);
			}

			if(key === 'socketResponse'){
				return (prop ? target[prop] : target)[key];
			}

			return (...params) => new Promise(async resolve => {
				const id = IdGenerator.text(24);
				resolvers[id] = {prop, key, resolve};
				await stream.send({prop, key, params, id}, 'scatter');
			});
		};

		const proxied = (prop) => {
			return new Proxy({}, {
				get(target, key){
					return proxyGet(prop, target, key);
				}
			})
		}

		window.wallet = new Proxy({
			storage:proxied('storage'),
			utility:proxied('utility'),
			sockets:proxied('sockets')
		}, {
			get(target, key) {
				if(['storage', 'utility', 'sockets'].includes(key)) return target[key];
				return proxyGet(null, target, key);
			},
		});

		const loadStyles = (tries = 0) => {
			if(tries >= 20) return console.error('Could not load styles!');
			if(typeof window.loadStyles === 'function'){
				window.loadStyles(location.origin + '/');
			}
			else setTimeout(() => loadStyles(tries++), 100);
		};
		loadStyles();

	}

}

new Inject();




