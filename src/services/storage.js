const apis = require('../util/browserapis');

let data = {};
const stores = {
	get:k => new Promise(r => apis.storage.local.get(k, x => {
		if(x && Object.keys(x).length && x.hasOwnProperty(k)) return r(x[k]);
		return r(null);
	})),
	set:(k,v) => new Promise(r => apis.storage.local.set({[k]:v}, () => r(v))),
	clear:() => new Promise(r => apis.storage.local.clear(() => r(true))),
};

const getGeneralSetting = (key) => {
	const saved = stores.get(key);
	if(saved === undefined) return null;
	return saved;
}
const setGeneralSetting = (key, val) => stores.set(key, val);

const getLanguage = () => {
	const saved = stores.get('language');
	if(saved === undefined) return null;
	return saved;
}
const setLanguage = lang => stores.set('language', lang);

const getSimpleMode = () => {
	const saved = stores.get('simple_mode');
	if(saved === undefined){
		return process.env.SIMPLE_BY_DEFAULT || false;
	}
	return saved;
};

const setSimpleMode = isSimpleMode => stores.set('simple_mode', isSimpleMode);

const getScatter = () => stores.get('scatter');
const setScatter = (scatter) => stores.set('scatter', scatter);
const removeScatter = () => stores.clear();

const getSalt = () => stores.get('salt') || 'SALT_ME';
const setSalt = (salt) => stores.set('salt', salt);







/***********************************/
/**            EXTRAS             **/
/***********************************/

let getSeed;
const getSeedSetter = (seeder) => getSeed = seeder;

const AES = require("aes-oop").default;

const cacheABI = (contractName, chainId, abi) => stores.set(`abis.${contractName}_${chainId}`, abi)
const getCachedABI = (contractName, chainId) => stores.get(`abis.${contractName}_${chainId}`)

const getTranslation = async () => {
	let translation = await stores.get('translation');
	if(!translation) return null;
	return AES.decrypt(translation, getSeed());
}

const setTranslation =  async (translation) => {
	const encrypted = AES.encrypt(translation, getSeed());
	return stores.set('translation', encrypted);
}

const getHistory = async () => {
	let history = await stores.get('history');
	if(!history) return [];
	history = AES.decrypt(history, getSeed());
	return history;
}

const updateHistory = async (x) => {
	let history = await getHistory();
	if(history.find(h => h.id === x.id)) history = history.filter(h => h.id !== x.id);
	history.unshift(x);
	const encrypted = AES.encrypt(history, getSeed());
	return stores.set('history', encrypted);
}

const deltaHistory = async (x) => {
	let history = await getHistory();
	if(x === null) history = [];
	else {
		if(history.find(h => h.id === x.id)) history = history.filter(h => h.id !== x.id);
		else history.unshift(x);
	}

	const encrypted = AES.encrypt(history, getSeed());
	return stores.set('history', encrypted);
}

const swapHistory = async (history) => {
	const encrypted = AES.encrypt(history, getSeed());
	return stores.set('history', encrypted);
}




const reencryptOptionals = async (oldseed, newseed) => {
	if(await stores.get('translation')){
		await stores.set('translation',
			AES.encrypt(AES.decrypt(await stores.get('translation'), oldseed), newseed));
	}

	if(await stores.get('history')){
		await stores.set('history',
			AES.encrypt(AES.decrypt(await stores.get('history'), oldseed), newseed));
	}

}







module.exports = {
	getGeneralSetting,
	setGeneralSetting,
	getSimpleMode,
	setSimpleMode,
	getLanguage,
	setLanguage,

	getScatter,
	setScatter,
	removeScatter,
	getSalt,
	setSalt,

	getSeedSetter,
	getSeed,

	// EXTRAS
	cacheABI,
	getCachedABI,
	getTranslation,
	setTranslation,
	getHistory,
	updateHistory,
	deltaHistory,
	swapHistory,
	reencryptOptionals,
}
