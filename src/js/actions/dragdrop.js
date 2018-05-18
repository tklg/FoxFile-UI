import queue from '../classes/UploadQueue';
import uuid from 'uuid/v4';

export const dragdrop = {
	DRAG_ENTER: 'drag_enter',
	DRAG_LEAVE: 'drag_leave',
	DRAG_DROP: 'drag_drop',
	UPLOAD_SINGLE: 'upload_single',
	UPLOAD_PROGRESS: 'upload_progress',
	UPLOAD_ENCRYPT: 'upload_encrypt',
	UPLOAD_DONE: 'upload_done',
};

export const dragEnter = (id, type) => {
	return {
		type: dragdrop.DRAG_ENTER,
		id,
		elemType: type,
	}
}
export const dragLeave = (id, type) => {
	return {
		type: dragdrop.DRAG_LEAVE,
		id,
		elemType: type,
	}
}
export const uploadStart = (id, files) => {
	return {
		type: dragdrop.DRAG_DROP,
		id,
		files,
	}
}
export const uploadSingle = data => {
	console.log('upevent: ' + data.id);
	return {
		type: dragdrop.UPLOAD_SINGLE,
	}
}
export const uploadProgress = data => {
	console.log(data);
	return {
		type: dragdrop.UPLOAD_PROGRESS,
	}
}
export const uploadEncrypt = data => {
	console.log(data);
	return {
		type: dragdrop.UPLOAD_ENCRYPT,
	}
}
export const uploadDone = data => {
	console.log('updone: ' + data);
	return {
		type: dragdrop.UPLOAD_DONE,
	}
}
export const dragDrop = (id, files) => {

	files = files.map(file => {
		return {
			id: uuid(), // temporary id, assigned final id by server
			parent: id,
			file,
		}
	})

	const fn = (dispatch, getState) => {
		dispatch(uploadStart(id, files));

		queue.offAll('done');
		queue.offAll('upload');
		queue.offAll('progress');
		queue.offAll('encrypt');

		queue.on('progress', data => {
			dispatch(uploadProgress(data));
		});
		queue.on('encrypt', data => {
			dispatch(uploadEncrypt(data));
		});
		queue.on('upload', data => {
			dispatch(uploadSingle(data));
		});
		queue.on('done', data => {
			dispatch(uploadDone(data));
		});

		queue.add(files);
	};
	return fn;
}
