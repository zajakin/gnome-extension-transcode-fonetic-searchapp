const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;
const AppDisplay = imports.ui.appDisplay;

// Get Gnome-shell version
const Config = imports.misc.config;
const [major, minor] = Config.PACKAGE_VERSION.split('.').map(s => Number(s));

var originalGetInitialResultSet = null;


const TrancodeRusToEngDict = {
    'а': 'a',
    'б': 'b',
    'в': 'w',
    'г': 'g',
    'д': 'd',
    'е': 'e',
    'ё': '#',
    'ж': 'v',
    'з': 'z',
    'и': 'i',
    'й': 'j',
    'к': 'k',
    'л': 'l',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'у': 'u',
    'ы': 'y',
    'х': 'h',
    'ф': 'f',
    'ц': 'c',
    'ч': '=',
    'ш': '[',
    'щ': ']',
    'ь': 'x',
    'ъ': '^',
    'э': '\\',
    'ю': '`',
    'я': 'q'
}

const TrancodeEngToRusDict = {};

function generateIvertedDict(sourceDict, destDict) {
    for(let sourceindex in sourceDict)  {
        destDict[sourceDict[sourceindex]] = sourceindex;
    }
}

function transcode(source, dict) {
    source = source.toLowerCase();
    let result = '';
    for (let i = 0; i < source.length; i++) {
        let char = source.charAt(i);
        let foundChar = dict[char];
        if (!foundChar) {
            foundChar = char;
        }
        result = result + foundChar;
    }
    return result;
}

function getResultSet(terms, callback, cancellable) {
    let query = terms.join(' ');
    let groups = Gio.DesktopAppInfo.search(query);
    groups = groups.concat(Gio.DesktopAppInfo.search(transcode(query, TrancodeRusToEngDict)));
    groups = groups.concat(Gio.DesktopAppInfo.search(transcode(query, TrancodeEngToRusDict)));
    let usage = Shell.AppUsage.get_default();
    let results = [];
    groups.forEach(function(group) {
        group = group.filter(function(appID) {
            let app = Gio.DesktopAppInfo.new(appID);
            return app && app.should_show();
        });
        results = results.concat(group.sort(function(a, b) {
            return usage.compare('', a, b);
        }));
    });
    if (major >= 43)
        return results;
    else
        callback(results);
}

function init() {
}

function enable() {
    generateIvertedDict(TrancodeRusToEngDict, TrancodeEngToRusDict);
    originalGetInitialResultSet = AppDisplay.AppSearchProvider.prototype.getInitialResultSet;
    AppDisplay.AppSearchProvider.prototype.getInitialResultSet = getResultSet;
}

function disable() {
    AppDisplay.AppSearchProvider.prototype.getInitialResultSet = originalGetInitialResultSet;
    originalGetInitialResultSet = null;
}
