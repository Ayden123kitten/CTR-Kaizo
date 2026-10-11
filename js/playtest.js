// This script is partially from ctrdx-editor
// https://github.com/yell0wsuit/ctrdx-editor/
// Credit to yellowsuit

const CHANNEL = "ctrdx-playtest";
const STORAGE_PREFIX = "ctrdx-playtest:";

/**
 * How old a stored level must be before any editor may remove it. Long enough that no live session
 * in another editor tab is swept, since an entry is refreshed on every Play.
 */
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

let channel = null;
let inbox = [];
let gameWindow = null;

export function playtestFormURL(url) {
    fetch(url)
    .then(response => response.text())
    .then(level => {
        const link = "./dx/";
        const nonce = "list-playtest";
        const level_message = JSON.stringify({ v: 1, type: "level", nonce: nonce, xml: level });

        openChannel();

        forgetLevel(nonce);
        if (!launch(link, nonce, level_message)) {
            alert("Can't open the level: browser blocked the popup :/");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

/** Opens the channel and starts queueing messages. Safe to call more than once. */
function openChannel() {
    if (channel) {
        return;
    }
    sweepStoredLevels();
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (event) => {
        if (typeof event.data === "string") {
            inbox.push(event.data);
        }
    };
}

/** Posts one JSON message. A no-op before open(). */
function post(json) {
    channel?.postMessage(json);
}

/** Takes every message queued since the last call. */
function drain() {
    if (inbox.length === 0) {
        return [];
    }
    const taken = inbox;
    inbox = [];
    return taken;
}

/**
 * Opens the game with a playtest nonce and keeps the handle.
 *
 * The URL is derived from this page's own location rather than configured, so the same-origin rule
 * the channel depends on cannot silently drift: if the game were ever served from somewhere else,
 * the channel would be dead too.
 *
 * @returns {boolean} false when the browser blocked the popup.
 */
function launch(link, nonce, levelMessage) {
    storeLevel(nonce, levelMessage);
    const url = new URL(link, globalThis.location.href);
    url.searchParams.set("playtest", nonce);
    gameWindow = globalThis.open(url.href, "ctrdx-playtest");
    return gameWindow !== null;
}

/** Whether a game window opened by launch() is still open. */
function isGameOpen() {
    return gameWindow !== null && !gameWindow.closed;
}

/**
 * Stores the level message a session's game reads when it boots, replacing any earlier one.
 *
 * Failing to store is not fatal: blocked site data or a full quota leaves the channel, which is
 * all a desktop browser needs.
 */
function storeLevel(nonce, levelMessage) {
    try {
        globalThis.localStorage.setItem(
            STORAGE_PREFIX + nonce,
            JSON.stringify({ storedAt: Date.now(), message: levelMessage }),
        );
    } catch (error) {
        // A failed write leaves the previous value in place, and a game booting from that would
        // play an older revision as if it were current. No entry falls back to the channel instead.
        forgetLevel(nonce);
        console.warn("playtest level could not be stored:", error);
    }
}

/** Removes a session's stored level. */
function forgetLevel(nonce) {
    try {
        globalThis.localStorage.removeItem(STORAGE_PREFIX + nonce);
    } catch {
        // Nothing could have been stored either.
    }
}

/**
 * Removes levels left behind by sessions that ended without saying so - an editor tab closed or
 * discarded while its game was running.
 */
function sweepStoredLevels() {
    try {
        const storage = globalThis.localStorage;
        const now = Date.now();
        const stale = [];
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key === null || !key.startsWith(STORAGE_PREFIX)) {
                continue;
            }
            let storedAt = 0;
            try {
                storedAt = JSON.parse(storage.getItem(key)).storedAt ?? 0;
            } catch {
                // Malformed, so stale.
            }
            if (now - storedAt > STALE_AFTER_MS) {
                stale.push(key);
            }
        }
        // Collected first: removing while iterating shifts the indices under the loop.
        for (const key of stale) {
            storage.removeItem(key);
        }
    } catch {
        // Blocked site data: nothing was stored to sweep.
    }
}