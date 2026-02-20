import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class TranscodeAppSearchPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    // ExtensionPreferences предоставляет встроенный метод для безопасного получения настроек
    const settings = this.getSettings(
      "org.gnome.shell.extensions.transcode-fonetic-searchapp",
    );

    // Создаем страницу настроек
    const page = new Adw.PreferencesPage({
      title: "Transliteration Settings",
      icon_name: "document-properties-symbolic",
    });

    // Создаем группу транслитерации
    const transliterationGroup = new Adw.PreferencesGroup({
      title: "Transliteration Methods",
      description: "Enable or disable different transliteration methods",
    });

    // Переключатель кириллицы в латиницу
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
      subtitle: "Search 'ашду' to find 'file-roller'",
      activatable_widget: cyrillicToLatinSwitch,
    });
    cyrillicToLatinRow.add_suffix(cyrillicToLatinSwitch);
    transliterationGroup.add(cyrillicToLatinRow);

    // Переключатель латиницы в кириллицу
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
      subtitle: "Search 'file-roller' to find application with Cyrillic name",
      activatable_widget: latinToCyrillicSwitch,
    });
    latinToCyrillicRow.add_suffix(latinToCyrillicSwitch);
    transliterationGroup.add(latinToCyrillicRow);

    // Переключатель фонетической раскладки
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
      subtitle: "Support phonetic keyboard layout transliteration",
      activatable_widget: phoneticLayoutSwitch,
    });
    phoneticLayoutRow.add_suffix(phoneticLayoutSwitch);
    transliterationGroup.add(phoneticLayoutRow);

    page.add(transliterationGroup);

    // Создаем группу выбора раскладки
    const layoutGroup = new Adw.PreferencesGroup({
      title: "Phonetic Layout Type",
      description: "Choose the phonetic layout to use",
    });

    const phoneticLayoutDropdown = new Gtk.DropDown();
    const stringList = Gtk.StringList.new(["Dvorak", "QWERTY"]);
    phoneticLayoutDropdown.set_model(stringList);

    // Устанавливаем текущий выбор
    const currentLayout = settings.get_string("phonetic-layout");
    phoneticLayoutDropdown.set_selected(currentLayout === "dvorak" ? 0 : 1);

    phoneticLayoutDropdown.connect("notify::selected-item", () => {
      const selected = phoneticLayoutDropdown.get_selected();
      const layoutValue = selected === 0 ? "dvorak" : "qwerty";
      settings.set_string("phonetic-layout", layoutValue);
    });

    settings.connect("changed::phonetic-layout", () => {
      const currentValue = settings.get_string("phonetic-layout");
      const index = currentValue === "dvorak" ? 0 : 1;
      phoneticLayoutDropdown.set_selected(index);
    });

    const layoutRow = new Adw.ActionRow({
      title: "Layout Type",
      activatable_widget: phoneticLayoutDropdown,
    });
    layoutRow.add_suffix(phoneticLayoutDropdown);
    layoutGroup.add(layoutRow);

    page.add(layoutGroup);

    // Добавляем страницу напрямую в окно, предоставленное GNOME
    window.add(page);
  }
}
