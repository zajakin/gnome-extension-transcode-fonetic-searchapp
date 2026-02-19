import Gio from "gi://Gio";
import Shell from "gi://Shell";
import GObject from "gi://GObject";
import Adw from "gi://Adw";
// noinspection JSFileReferences
import * as AppDisplay from "resource:///org/gnome/shell/ui/appDisplay.js";

// Cyrillic to Latin transliteration
const cyrillicToLatinDefault = new Map([
    ['а', 'a'],
    ['б', 'b'],
    ['в', 'v'],
    ['г', 'g'],
    ['д', 'd'],
    ['е', 'e'],
    ['ё', 'yo'],
    ['ж', 'zh'],
    ['з', 'z'],
    ['и', 'i'],
    ['й', 'y'],
    ['к', 'k'],
    ['л', 'l'],
    ['м', 'm'],
    ['н', 'n'],
    ['о', 'o'],
    ['п', 'p'],
    ['р', 'r'],
    ['с', 's'],
    ['т', 't'],
    ['у', 'u'],
    ['ы', 'y'],
    ['х', 'h'],
    ['ф', 'f'],
    ['ц', 'c'],
    ['ч', 'ch'],
    ['ш', 'sh'],
    ['щ', 'sch'],
    ['ь', ''],
    ['ъ', ''],
    ['э', 'e'],
    ['ю', 'yu'],
    ['я', 'ya']
]);

// Default phonetic layout (Dvorak-like phonetic)
const phoneticLayoutDefault = new Map([
    ['а', 'a'],
    ['б', 'b'],
    ['в', 'w'],
    ['г', 'g'],
    ['д', 'd'],
    ['е', 'e'],
    ['ё', '#'],
    ['ж', 'v'],
    ['з', 'z'],
    ['и', 'i'],
    ['й', 'j'],
    ['к', 'k'],
    ['л', 'l'],
    ['м', 'm'],
    ['н', 'n'],
    ['о', 'o'],
    ['п', 'p'],
    ['р', 'r'],
    ['с', 's'],
    ['т', 't'],
    ['у', 'u'],
    ['ы', 'y'],
    ['х', 'h'],
    ['ф', 'f'],
    ['ц', 'c'],
    ['ч', '='],
    ['ш', '['],
    ['щ', ']'],
    ['ь', 'x'],
    ['ъ', '%'],
    ['э', '\'],
    ['ю', '`'],
    ['я', 'q']
]);

let originalGetInitialResultSet = null;

// Maps for bidirectional transliteration
const cyrillicToLatin = new Map(cyrillicToLatinDefault);
const latinToCyrillic = new Map();
const phoneticLayout = new Map(phoneticLayoutDefault);
const phoneticToLatin = new Map();

function generateInvertedDict(sourceMap, destMap) {
    sourceMap.forEach((value, key) => {
        destMap.set(value, key);
    });
}

function transcode(source, transcodeCharMap) {
    source = source.toLowerCase();
    return [...source]
        .map((char) => transcodeCharMap.get(char) || char)
        .join("");
}

function getResultSet(terms) {
    let query = terms.join(" ");
    let groups = [];
    const systemCommands = [
        "restart",
        "poweroff",
        "shutdown",
        "reboot",
        "logout",
    ];

    if (systemCommands.includes(query.toLowerCase())) {
        return originalGetInitialResultSet.call(
            AppDisplay.AppSearchProvider,
            terms
        );
    }

    try {
        // Original query
        groups = Gio.DesktopAppInfo.search(query);
        
        // Cyrillic to Latin transliteration
        groups = groups.concat(
            Gio.DesktopAppInfo.search(transcode(query, cyrillicToLatin))
        );
        
        // Latin to Cyrillic transliteration
        groups = groups.concat(
            Gio.DesktopAppInfo.search(transcode(query, latinToCyrillic))
        );
        
        // Phonetic layout transliteration
        groups = groups.concat(
            Gio.DesktopAppInfo.search(transcode(query, phoneticLayout))
        );
        
        // Phonetic to Latin transliteration
        groups = groups.concat(
            Gio.DesktopAppInfo.search(transcode(query, phoneticToLatin))
        );
    } catch (error) {
        console.error("An error occurred while searching:", error);
    }

    let usage = Shell.AppUsage.get_default();
    let results = [];
    groups.forEach(function (group) {
        group = group.filter(function (appID) {
            let app = Gio.DesktopAppInfo.new(appID);
            return app && app.should_show();
        });
        results = results.concat(
            group.sort(function (a, b) {
                return usage.compare(a, b);
            })
        );
    });

    // Remove duplicates while preserving order
    let seen = new Set();
    return results.filter(appID => {
        if (seen.has(appID)) {
            return false;
        }
        seen.add(appID);
        return true;
    });
}

export default class TranscodeAppSearchExtension {
    constructor(metadata) {
        this.metadata = metadata;
    }

    enable() {
        if (originalGetInitialResultSet === null) {
            // Initialize maps
            generateInvertedDict(cyrillicToLatin, latinToCyrillic);
            generateInvertedDict(phoneticLayout, phoneticToLatin);
            
            // Patch AppSearchProvider
            originalGetInitialResultSet =
                AppDisplay.AppSearchProvider.prototype.getInitialResultSet;
            AppDisplay.AppSearchProvider.prototype.getInitialResultSet =
                getResultSet;
        }
    }

    disable() {
        if (originalGetInitialResultSet !== null) {
            AppDisplay.AppSearchProvider.prototype.getInitialResultSet =
                originalGetInitialResultSet;
            originalGetInitialResultSet = null;
        }
        latinToCyrillic.clear();
        phoneticToLatin.clear();
    }
}