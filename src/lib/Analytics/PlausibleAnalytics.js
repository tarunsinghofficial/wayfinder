import { PUBLIC_ANALYTICS_DOMAIN, PUBLIC_ANALYTICS_ENABLED } from '$env/static/public';

class PlausibleAnalytics {
	constructor(domain) {
		this.domain = domain;
		this.defaultProperties = {};
		this.enabled = PUBLIC_ANALYTICS_ENABLED === 'true' && PUBLIC_ANALYTICS_DOMAIN !== '';
	}

	async postEvent(pageURL, eventName, props = {}) {
		if (!this.enabled) {
			console.debug('Analytics disabled: skipping event');
			return;
		}

		const payload = {
			domain: this.domain,
			name: eventName,
			url: pageURL,
			props: this.buildProps(props)
		};

		try {
			console.debug('Sending event:', payload);
			const response = await fetch(`/api/events`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Error sending event: ${response.statusText}. ${errorText}`);
			}
			return response.json();
		} catch (error) {
			console.error('Error tracking event:', error);
			throw error;
		}
	}

	async reportPageView(pageURL, props = {}) {
		return this.postEvent(pageURL, 'pageview', props);
	}

	async reportSearchQuery(query) {
		return this.postEvent('/search', 'search', { query: query });
	}

	async reportStopViewed(id, stopDistance) {
		return this.postEvent('/stop', 'pageview', { id: id, distance: stopDistance });
	}

	async reportRouteClicked(routeId) {
		return this.postEvent('/route', 'click', { id: routeId });
	}

	async reportArrivalClicked(action) {
		return this.postEvent('/arrivals', 'click', { item_id: action });
	}

	buildProps(otherProps = {}) {
		return { ...this.defaultProperties, ...otherProps };
	}
}

const analytics = new PlausibleAnalytics(PUBLIC_ANALYTICS_DOMAIN);
export default analytics;
