import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class TranscodeAppSearchPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const page = new Adw.PreferencesPage({
      title: "Transliteration Settings",
      icon_name: "document-properties-symbolic",
    });

    const transliterationGroup = new Adw.PreferencesGroup({
      title: "Transliteration Methods",
      description: "Enable or disable different transliteration methods",
    });

    // Cyrillic to Latin
    const cyrillicToLatinSwitch = new Gtk.Switch({
      active: settings.get_boolean("enable-cyrillic-to-latin"),
      valign: Gtk.Align.CENTER,
    });
    settings.bind(
      "enable-cyrillic-to-latin",
      cyrillicToLatinSwitch,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );
    const cyrillicToLatinRow = new Adw.ActionRow({
      title: "Cyrillic to Latin",
      subtitle: "Search 'Учеу' to find 'Extensions'",
      activatable_widget: cyrillicToLatinSwitch,
    });
    cyrillicToLatinRow.add_suffix(cyrillicToLatinSwitch);
    transliterationGroup.add(cyrillicToLatinRow);

    // Latin to Cyrillic
    const latinToCyrillicSwitch = new Gtk.Switch({
      active: settings.get_boolean("enable-latin-to-cyrillic"),
      valign: Gtk.Align.CENTER,
    });
    settings.bind(
      "enable-latin-to-cyrillic",
      latinToCyrillicSwitch,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );
    const latinToCyrillicRow = new Adw.ActionRow({
      title: "Latin to Cyrillic",
      subtitle: "Search 'Hfcib' to find 'Расширения'",
      activatable_widget: latinToCyrillicSwitch,
    });
    latinToCyrillicRow.add_suffix(latinToCyrillicSwitch);
    transliterationGroup.add(latinToCyrillicRow);

    // Phonetic Layout
    const phoneticLayoutSwitch = new Gtk.Switch({
      active: settings.get_boolean("enable-phonetic-layout"),
      valign: Gtk.Align.CENTER,
    });
    settings.bind(
      "enable-phonetic-layout",
      phoneticLayoutSwitch,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );
    const phoneticLayoutRow = new Adw.ActionRow({
      title: "Phonetic Layout",
      subtitle:
        "Support phonetic: 'Ras[i' to find 'Расширения' and 'Еьтен' to find 'Extensions'",
      activatable_widget: phoneticLayoutSwitch,
    });
    phoneticLayoutRow.add_suffix(phoneticLayoutSwitch);
    transliterationGroup.add(phoneticLayoutRow);

    page.add(transliterationGroup);
    window.add(page);
  }
}
