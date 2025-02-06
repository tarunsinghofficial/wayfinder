import Controls from "flowbite-svelte/Controls.svelte";

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export function getUserId() {
    let userId = getCookie('userId');
    if (!userId) {
        userId = crypto.randomUUID();


        //! Set cookie for 1 year
        document.cookie = `userId=${userId}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }
    return userId;
}
