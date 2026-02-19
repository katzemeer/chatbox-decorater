// Import from SillyTavern core
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

// Extension name MUST match folder name exactly
const extensionName = "chatbox-decorator";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

const defaultSettings = {
    enabled: false,
    theme: "flowers"
};

// ─── Load saved settings into UI ────────────────────────────────────────────
async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }

    const s = extension_settings[extensionName];
    $("#chatbox_decorator_enabled").prop("checked", s.enabled);
    $("#chatbox_decorator_theme").val(s.theme);

    // Apply decoration immediately on load if enabled
    if (s.enabled) applyDecoration(s.theme);
}

// ─── Apply / remove decoration ───────────────────────────────────────────────
function applyDecoration(theme) {
    removeDecoration();

    const themes = {
        flowers: { tl: "🌸", tr: "🌺", bl: "🌼", br: "🌻" },
        cats:    { tl: "🐱", tr: "😺", bl: "😸", br: "🐾" },
        stars:   { tl: "⭐", tr: "✨", bl: "💫", br: "🌟" },
        hearts:  { tl: "💖", tr: "💗", bl: "💝", br: "💓" },
    };

    const icons = themes[theme] || themes.flowers;

    const positions = ["tl", "tr", "bl", "br"];
    positions.forEach(pos => {
        const el = document.createElement("div");
        el.className = `chatbox-deco chatbox-deco-${pos}`;
        el.textContent = icons[pos];
        el.id = `chatbox-deco-${pos}`;
        document.body.appendChild(el);
    });

    console.log(`[${extensionName}] ✅ Decoration applied: ${theme}`);
}

function removeDecoration() {
    document.querySelectorAll(".chatbox-deco").forEach(el => el.remove());
}

// ─── Event handlers ───────────────────────────────────────────────────────────
function onEnabledChange(event) {
    const value = Boolean($(event.target).prop("checked"));
    extension_settings[extensionName].enabled = value;
    saveSettingsDebounced();

    const theme = extension_settings[extensionName].theme;
    if (value) {
        applyDecoration(theme);
    } else {
        removeDecoration();
    }
}

function onThemeChange(event) {
    const value = $(event.target).val();
    extension_settings[extensionName].theme = value;
    saveSettingsDebounced();

    if (extension_settings[extensionName].enabled) {
        applyDecoration(value);
    }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
jQuery(async () => {
    console.log(`[${extensionName}] Loading...`);

    try {
        const settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);
        $("#extensions_settings2").append(settingsHtml);

        $("#chatbox_decorator_enabled").on("input", onEnabledChange);
        $("#chatbox_decorator_theme").on("change", onThemeChange);

        await loadSettings();

        console.log(`[${extensionName}] ✅ Loaded successfully`);
    } catch (error) {
        console.error(`[${extensionName}] ❌ Failed to load:`, error);
    }
});
