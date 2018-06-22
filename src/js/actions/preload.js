export const preload = {
	LOAD_USER: 'load_user',
	LOAD_TREE: 'load_tree',
	DECRYPT_TREE: 'decrypt_tree',
	PRELOAD_DONE: 'preload_done',
};

export const loadUser = (user) => (
{
	type: preload.LOAD_USER,
	data: user,
}
);

export const loadTree = (tree) => (
{
	type: preload.LOAD_TREE,
	data: tree
}
);

export const decryptTree = (tree) => (
{
	type: preload.DECRYPT_TREE,
	data: tree
}
);

export const preloadDone = () => (
{
	type: preload.PRELOAD_DONE
}
);
