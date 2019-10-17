
const getDefaultPath = () => {
	return console.error(`Extensions don't have a default path!`);
}
const getFileLocation = (extensions) => {
	return console.error(`Implement getFileLocation!`);
}
const getFolderLocation = () => {
	return console.error(`Implement getFolderLocation!`);
}

const saveFile = (path, name, data, encoding = 'utf-8') => {
	return console.error(`Extensions can't save files!`);
};

const openFile = (path, encoding = 'utf-8') => {
	return console.error(`Extensions can't open files!`);
};

const exists = path => {
	return console.error(`Extensions can't tell if files exist!`);
}

const existsOrMkdir = (path) => {
	return console.error(`Extensions can't existsOrMkdir!`);
};

const getFilesForDirectory = async (path) => {
	return console.error(`Extensions can't getFilesForDirectory!`);
};

module.exports = {
	getDefaultPath,
	getFileLocation,
	getFolderLocation,
	exists,
	existsOrMkdir,
	saveFile,
	openFile,
	getFilesForDirectory
}
