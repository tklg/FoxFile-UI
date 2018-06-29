import fc from 'filecrypt';
import Util from './Util';
import base64 from 'base64-js';
import AES from './Aes';

const enc = 'utf-8';
const encoder = new TextEncoder(/*enc*/);
const decoder = new TextDecoder(/*enc*/);

function base64Encode(str, encoding = 'utf-8') {
    var bytes = new (TextEncoder || TextEncoderLite)(encoding).encode(str);        
    return base64.fromByteArray(bytes);
}
function base64Decode(str, encoding = 'utf-8') {
    var bytes = base64.toByteArray(str);
    return new (TextDecoder || TextDecoderLite)(encoding).decode(bytes);
}
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
async function encrypt(file, key) {
	try {
		const parentKey = key || await DEFAULT_KEY() // should be raw key of parent folder
		const fileKeyString = rv();
		const fileKey = await fc.importPassword(fileKeyString);
		let encryptedFile;
		if (/\./g.test(file.name)) { // temporary
			// encrypt file with file key
			const encryptedFileData = await fc.encrypt(fileKey, file);
			encryptedFile = fc.ab2file(fc.mergeIvAndData(encryptedFileData.iv.buffer, encryptedFileData.result));
		}
		// encrypt file name with file key
		// const fileNameAsBuffer = encoder.encode(file.name);
		// const fileNameAsBuffer = Util.str2ab(file.name);
		// const fileNameAsBuffer = base64Decode(file.name);
		/*console.log(fileNameAsBuffer)
		const encryptedFilenameData = await fc.encrypt(fileKey, fileNameAsBuffer);
		console.log(encryptedFilenameData)
		const encryptedFilenameString = Util.ab2str(fc.mergeIvAndData(encryptedFilenameData.iv.buffer, encryptedFilenameData.result));*/
		// const encryptedFilenameString = fc.ab2str(fc.mergeIvAndData(encryptedFilenameData.iv.buffer, encryptedFilenameData.result));
		// const encryptedFilenameString = base64Encode(decoder.decode(fc.mergeIvAndData(encryptedFilenameData.iv.buffer, encryptedFilenameData.result)));
		// const encryptedFilenameString = decoder.decode(fc.mergeIvAndData(encryptedFilenameData.iv.buffer, encryptedFilenameData.result));
		// console.log(encryptedFilenameString);
		// secure wrap file key with parent key
		/*const keyBuf = await fc.wrapKey(fileKey, parentKey);
		console.log(keyBuf);*/
		// console.log(fc.mergeIvAndData(keyBuf.iv.buffer, keyBuf.key));
		// console.log(decoder.decode(fc.mergeIvAndData(keyBuf.iv.buffer, keyBuf.key)));
		/*const keyString = Util.ab2str(fc.mergeIvAndData(keyBuf.iv.buffer, keyBuf.key));*/
		// const keyString = fc.ab2str(fc.mergeIvAndData(keyBuf.iv.buffer, keyBuf.key));
		// const keyString = base64Encode(decoder.decode(fc.mergeIvAndData(keyBuf.iv.buffer, keyBuf.key)));
		// const keyString = decoder.decode(fc.mergeIvAndData(keyBuf.iv.buffer, keyBuf.key));
		// const keyString = Util.btoa64(decoder.decode(fc.mergeIvAndData(keyBuf.iv.buffer, keyBuf.key)));
		// const keyString = new Uint8Array(fc.mergeIvAndData(keyBuf.iv.buffer, keyBuf.key)).toString();

		const keyString = await AES.encrypt(fileKeyString, parentKey);
		console.log(keyString)

		return {
			encryptedFile: encryptedFile,
			encryptedFilename: await AES.encrypt(file.name, fileKey),
			keyString: keyString,
		};
	} catch (e) {
		throw new Error(e);
	}
}

/*const s = 'ᡄ崚䭡궶꙲竔믺鍂捍띊浀堌梵Ṵ봧腡馵ါ昷罿ꇘ�ｻ盖ᮅ�੼䷾輠댙橹ꃏ駞綂㽑刚莥㾘龅要泇诀㛴鬆締菦瞳趣쾝ﲙヨጪ㪂惆﹤੧띾扁䐐篎斈Ѩ㚶펠⸢꼥뿨앲酚⪮뷞呪ⷶ⎴頌ⴄЊ';
console.log(s)
console.log(Util.str2ab(s))
console.log(Util.ab2str(Util.str2ab(s)));
console.log(Util.str2ab(Util.ab2str(Util.str2ab(s))));*/

async function decrypt({fileName, file, fileKey}, key) {
	// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_2_%E2%80%93_rewrite_the_DOMs_atob()_and_btoa()_using_JavaScript's_TypedArrays_and_UTF-8
	try {
		const parentKey = key || await DEFAULT_KEY(); // should be raw key of parent folder
		//console.log(fileKey)
		const keyString = await AES.decrypt(fileKey, parentKey);
		//console.log(keyString)
		// console.log(fileKey);
		// console.log(base64Decode(fileKey));
		// console.log(fc.str2ab(fileKey));
		// console.log(Util.str2ab(fileKey));
		// console.log(new Uint8Array(fileKey.split(',').map(n => +n)));
		// console.log(encoder.encode(fileKey));
		// const keyBuf = fc.splitIvAndData(fc.str2ab(fileKey));
		// const keyBuf = fc.splitIvAndData(Util.str2ab(fileKey));
		// const keyBuf = fc.splitIvAndData(encoder.encode(fileKey));
		// const keyBuf = fc.splitIvAndData(new Uint8Array(fileKey.split(',').map(n => +n)).buffer);
		// console.log(keyBuf);
		// const decryptingKey = await fc.unwrapKey(keyBuf.data, parentKey, keyBuf.iv);
		const decryptingKey = await fc.importPassword(keyString);
		//console.log(decryptingKey);

		//console.log(fileName);
		// console.log(Util.str2ab(fileName));

		// const nameBuf = fc.splitIvAndData(fc.str2ab(fileName));
		// const nameBuf = fc.splitIvAndData(Util.str2ab(fileName));
		// const nameBuf = fc.splitIvAndData(encoder.encode(fileName));
		// const decryptedName = await fc.decrypt(decryptingKey, nameBuf.iv, nameBuf.data);
		// const fileNamePlain = Util.ab2str(decryptedName);
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

export default {
	encrypt,
	decrypt,
}