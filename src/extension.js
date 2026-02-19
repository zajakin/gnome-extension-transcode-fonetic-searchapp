import Gio from "gi://Gio";
import Shell from "gi://Shell";
// noinspection JSFileReferences
import * as AppDisplay from "resource:///org/gnome/shell/ui/appDisplay.js";

let originalGetInitialResultSet = null;

const cyrillicToLatin = new Map([
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
    ['ъ', '^'],
    ['э', '\\'],
    ['ю', '`'],
    ['я', 'q]'
]);

const latinToCyrillic = new Map();

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
        groups = Gio.DesktopAppInfo.search(query);
        groups = groups.concat(
            Gio.DesktopAppInfo.search(transcode(query, cyrillicToLatin))
        );
        groups = groups.concat(
            Gio.DesktopAppInfo.search(transcode(query, latinToCyrillic))
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
    return results;
}

export default class TranscodeAppSearchExtension {
    enable() {
        if (originalGetInitialResultSet === null) {
            generateInvertedDict(cyrillicToLatin, latinToCyrillic);
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
    }
}
