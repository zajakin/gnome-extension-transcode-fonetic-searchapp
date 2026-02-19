# gnome-extension-transcode-searchapp
Gnome-shell extension making apps search in launcher layout-idependent
Simply install, enable and try to search app like 'ашду' - file-roller appears in search result.

Расширение для gnome-shell, которое позволяет искать приложения и документы не переключая раскладки клавиатуры. Если вы вводите в поиске, например, 'ашду', то в результатах отобразится приложение file-roller. (Справедливо для случая, если у вас английская локализация)

Двусторонняя транслитерация - теперь работает в обе стороны (Cyrillic ↔ Latin)

✅ Поддержка фонетической раскладки - добавлена отдельная карта для фонетической раскладки

✅ Система настроек - добавлена поддержка GSettings для управления включением/отключением методов транслитерации

✅ Удаление дубликатов - результаты проверяются на дубликаты для чистоты

✅ Совместимость с GNOME 50 - использование стандартного API без устаревших функций

Как установить:

Поместите файлы в ~/.local/share/gnome-shell/extensions/transcode-fonetic-searchapp/

Скомпилируйте schemaxml: glib-compile-schemas ~/.local/share/gnome-shell/extensions/transcode-fonetic-searchapp/schemas/

Перезагрузитесь или нажмите Alt+F2 и введите r
