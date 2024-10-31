export function buildURL(baseURL, path, params) {
	const cleanBase = baseURL.replace(/\/+$/, '');
	const cleanPath = path.replace(/^\/+/, '');
	const url = [cleanBase, cleanPath].join('/');
	const query = new URLSearchParams(params);

	return `${url}?${query.toString()}`;
}
