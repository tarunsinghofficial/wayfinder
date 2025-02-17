import { PUBLIC_ANALYTICS_DOMAIN, PUBLIC_ANALYTICS_API_HOST } from '$env/static/public';

export async function POST({ request }) {
	try {
		const { name, url, referrer, props } = await request.json();

		const res = await fetch(`${PUBLIC_ANALYTICS_API_HOST}/api/event`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				domain: PUBLIC_ANALYTICS_DOMAIN,
				name,
				url,
				referrer,
				props
			})
		});

		if (!res.ok) {
			return new Response(JSON.stringify({ error: `Error sending event: ${res.statusText}` }), {
				status: res.status,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const text = await res.text();
		let data;
		try {
			data = JSON.parse(text);
		} catch {
			data = { status: text };
		}
		return new Response(JSON.stringify(data), {
			status: res.status,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
