import fc from 'filecrypt';
import Util from './Util';
import base64 from 'base64-js';
import AES from './Aes';

const enc = 'utf-8';
const encoder = new TextEncoder(enc);
const decoder = new TextDecoder(enc);

function rv() {
	return (new TextDecoder().decode(window.crypto.getRandomValues(new Uint8Array(24))));
}

let _defk = null;
async function DEFAULT_KEY() {
	console.warn("dont use DEFAULT_KEY");
	if (_defk) return _defk;
	else {
		_defk = await fc.importPassword('foxfoxfox');
		return _defk;
	}
}
async function encrypt(data, key) {
	try {
		const {file, name} = data;
		const parentKey = key || await DEFAULT_KEY() // should be raw key of parent folder
		const fileKeyString = rv();
		const fileKey = await fc.importPassword(fileKeyString);
		let encryptedFile;
		if (file) {
			// encrypt file with file key
			const encryptedFileData = await fc.encrypt(fileKey, file);
			encryptedFile = fc.ab2file(fc.mergeIvAndData(encryptedFileData.iv.buffer, encryptedFileData.result));
		}

		const keyString = await AES.encrypt(fileKeyString, parentKey);
		console.log(keyString)

		return {
			encryptedFile: encryptedFile,
			encryptedFilename: await AES.encrypt(name, fileKey),
			keyString: keyString,
		};
	} catch (e) {
		throw new Error(e);
	}
}

async function decrypt({fileName, file, fileKey}, key) {
	// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_2_%E2%80%93_rewrite_the_DOMs_atob()_and_btoa()_using_JavaScript's_TypedArrays_and_UTF-8
	try {
		const parentKey = key || await DEFAULT_KEY(); // should be raw key of parent folder
		//console.log(fileKey)
		const keyString = await AES.decrypt(fileKey, parentKey);
		const decryptingKey = await fc.importPassword(keyString);
		if (file) {
			const buffer = fc.splitIvAndData(await fc.file2ab(file));
			const decryptedFile = fc.decrypt(decryptingKey, buffer.iv, buffer.data);
			return {
				file: decryptedFile,
			};
		} else {
			const fileNamePlain = await AES.decrypt(fileName, decryptingKey);
			// const fileNamePlain = decoder.decode(decryptedName);
			console.log(fileNamePlain);
			return {
				fileName: fileNamePlain,
			};
		}
	} catch (e) {
		throw new Error(e)
	}
}

async function sign(str, pass) {
	const buffer = Util.str2ab(pass);
	const dataBuffer = Util.str2ab(str);
	const key = await crypto.subtle.importKey('raw', buffer, {
		name: 'HMAC',
		hash: {name: 'SHA-512'}
	}, false, ['sign', 'verify']);
	const sig = await crypto.subtle.sign('HMAC', key, dataBuffer);
	const res = Util.ab2hex(sig);
	return res;
}

async function verify(str, orig, pass) {
	const buffer = Util.str2ab(pass);
	const dataBuffer = Util.str2ab(orig);
	const sigBuffer = Util.hex2ab(str);
	const key = await crypto.subtle.importKey('raw', buffer, {
		name: 'HMAC',
		hash: {name: 'SHA-512'}
	}, false, ['sign', 'verify']);
	const res = await crypto.subtle.verify('HMAC', key, sigBuffer, dataBuffer);
	return res;
}

export default {
	encrypt,
	decrypt,
	sign,
	verify,
}