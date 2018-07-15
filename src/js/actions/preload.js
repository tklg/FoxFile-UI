export const preload = {
	LOAD_USER: 'load_user',
	LOAD_TREE: 'load_tree',
	DECRYPT_TREE: 'decrypt_tree',
	PRELOAD_DONE: 'preload_done',
	CHECK_KEY: 'check_key',
	SET_KEY: 'set_key',
};

export const loadUser = (user) => ({
	type: preload.LOAD_USER,
	data: user,
});

export const checkKey = key => ({
	type: preload.CHECK_KEY,
	data: key,
});

export const loadTree = (tree) => ({
	type: preload.LOAD_TREE,
	data: tree
});

export const decryptTree = (tree) => ({
	type: preload.DECRYPT_TREE,
	data: tree
});

export const preloadDone = () => ({
	type: preload.PRELOAD_DONE
});

export const setBaseKey = key => ({
	type: preload.SET_KEY,
	data: key
});
