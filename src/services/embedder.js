const createHash = require('create-hash');
const {POST} = require('@walletpack/core/services/apis/BackendApiService');
const path = require('path');
const ecc = require('eosjs-ecc');


const HOST = process.env.WEB_HOST;
const PROOF_KEYS = process.env.PROOF_KEYS.split(',');

const hash = x => createHash('sha256').update(x).digest('hex')

const getSource = (filename, method = "GET") => {
	return fetch(`${HOST}/${filename}`, {method, cache:"no-cache"}).then(async x => {
		return {etag:x.headers.get('etag'), file:await x.text()};
	}).catch(err => {
		console.error('source error', err);
		return null;
	});
};

const WEB_APP_ERR = `Your desktop client could not make a connection with our web wallet embed, so it can't verify that it is safe to use. If you are in a country which restricts IPs such as China or Russia, you may need to enable a proxy.`;
const API_ERR = `Scatter failed to make a connection with our API which is used to verify the hash of the web wallet embed. If you are in a country which restricts IPs such as China or Russia, you may need to enable a proxy.`
const HASH_ERR = `The hash created from the web wallet embed does not match the hash returned from our secure API. This could be due to an update happening right now. Please try again in a moment. If this problem persists please contact support immediately at support@get-scatter.com, or on Telegram on the @Scatter channel, or Twitter at @Get_Scatter.`



const checkSignature = (hashed, signed) => {
	let proven = false;
	for(let i = 0; i < PROOF_KEYS.length; i++){
		try {
			if(ecc.recoverHash(signed, hashed) === PROOF_KEYS[i]) {
				proven = true;
				break;
			}
		} catch(e){}
	}
	return proven;
}





class WebHashChecker {


	// Hashes and signatures are fetched on a round-robin basis, so each hash+sig for a file is gotten
	// from a different server than the one the file was fetched from.
	static async fileVerified(filename, file){

		const hashsig = await getSource(`hashes/${filename}.hash`).then(x => x.file.trim()).catch(() => null);
		if(!hashsig) return false;

		const [hashed, signed] = hashsig.split('|').map(x => x.trim());
		return hash(file) === hashed && checkSignature(hashed, signed);
	}

	static async checkEmbed(){
		if(process.env.WEB_HOST === 'http://localhost:8081') return true;

		const filesList = await fetch(`${HOST}/hashes/`).then(x => x.json()).then(x =>
			x.map(y => y.name.replace('.hash', ''))
				.filter(x => x !== 'embed.timestamp')
		).catch(() => null);
		if(!filesList) return alert(API_ERR);

		let error = null;
		const checkFileHash = async (filename) => {
			if(error) return false;


			// Sources are fetched on a round-robin basis, so each file is gotten
			// from a different server, making the attack surface as large as our server count.
			const result = await getSource(filename).catch(() => null);
			if(!result || !result.file.length) return error = WEB_APP_ERR;

			if(this.fileVerified(filename, result.file)) return true;
			else error = API_ERR;

			// Alerts about bad hashes are sent to a completely separate API which runs under different
			// security measures and is detached from the entire Embed system.
			await POST(`bad_hash`, {
				filename,
				fileHash:hash(result.file),
			}).catch(err => {
				console.error('bad hash error', err);
			});

			return false;
		};

		let verified = 0;
		await Promise.all(filesList.map(async filename => {
			if(!await checkFileHash(filename)) return error = HASH_ERR;
			else verified++;
		}));

		if(error) return alert(error);
		return verified === filesList.length;
	}


}

module.exports = WebHashChecker;
