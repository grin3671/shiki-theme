# Сборщик shiki-theme
Инструмент для сборки темы. Работает на [Vue.js](https://github.com/vuejs/vue), файлы собирает [Sass.js](https://github.com/medialize/sass.js).

### Файлы темы
Файлы темы хранятся в папке [/assets](https://github.com/grin3671/shiki-theme/tree/master/assets/), а их список в файле – [theme-files.json](https://github.com/grin3671/shiki-theme/tree/master/config/theme_files.json). Каждая ветка может иметь собственный набор файлов и конфигурацию.


### Настройки сборщика
Списки палитр, схем и переменных темы хранятся в ветке сборщика в папке [/config](config/). Также тут есть пример файла с пользовательскими настройками, которые сохраняются в localStorage в процессе настройки темы.
