'use strict';

Vue.component('file', {
  props: ['file', 'index'],
  computed: {
    file_name: function () {
      return this.file.url.substring(this.file.url.lastIndexOf('/') + 1);
    },
  },
  template: '<label class="md-list md-control" ' +
              ':class="file.disabled ? \'disabled\' : \'\'" ' +
            '>' +
              '<md-control ' +
                'v-model="file.checked" ' +
                ':type="file.cat ? \'radio\' : \'checkbox\'"' +
                ':name="file.cat" ' +
                ':disabled="file.disabled" ' +
                '@change="onChange" ' +
              '></md-control>' +
              '<span :class="file.cat ? \'md-radio\' : \'md-checkbox\'"></span>' +
              '<span :data-url="file.url">{{ file.title ? file.title : file_name }}</span>' +
              '<div class="md-list_description" v-if="file.description">{{ file.description }}</div>' +
            '</label>',
  methods: {
    onChange: function () {
      this.$emit('change', this.file.cat, this.index);
    },
  },
});

Vue.component('md-control', {
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: ['type', 'name', 'checked', 'disabled'],
  template: '<input ' +
              ':type="type" ' +
              ':name="name" ' +
              ':checked="checked" ' +
              ':disabled="disabled" ' +
              '@change="$emit(\'change\', $event.target.checked)" ' +
            '>',
});

Vue.component('color-scheme', {
  props: ['name', 'value'],
  template: '<label class="md-control">' +
              '<input type="radio" ' +
                'name="scheme" ' +
                ':value="value" ' +
                'v-model="$root.user.selected_scheme" ' +
                '@change="$root.loadColorSet(\'scheme\')" ' +
              '>' +
              '<span class="md-radio"></span>' +
              '<span><slot>{{ name }}</slot></span>' +
            '</label>',
});

Vue.component('color-pallete', {
  props: ['name', 'value'],
  template: '<label class="md-control">' +
              '<input type="radio" ' +
                'name="color_pallete" ' +
                ':value="value" ' +
                'v-model="$root.user.selected_pallete" ' +
                '@change="$root.loadColorSet(\'pallete\')" ' +
              '>' +
              '<span class="md-radio"></span>' +
              '<span><slot>{{ name }}</slot></span>' +
            '</label>',
});

Vue.component('color-variable', {
  props: ['variable', 'index'],
  computed: {
    sass_name: function () {
      return '$' + this.index.replace(/_/g, '-');
    },
  },
  template: '<div class="md-list">' +
              '<input type="color" class="md-list_control" ' +
                ':id="index" ' +
                ':name="index" ' +
                'v-model="$root.scheme[index]" ' +
                '@change="$root.changeColorSet(variable.category)">' +
              '<input type="text" class="md-list_control" ' +
                'v-model="$root.scheme[index]" ' +
                '@change="$root.changeColorSet(variable.category)">' +
              '<template v-if="variable.name">' +
                '<div class="md-list_title md-list_title--twoline">' +
                  '<label :for="index">{{ variable.name }}</label>' +
                  '<span><code>{{ sass_name }}</code></span>' +
                '</div>' +
              '</template>' +
              '<template v-else>' +
                '<label class="md-list_title" :for="index">' +
                  '<span>{{ sass_name }}</span>' +
                '</label>' +
              '</template>' +
              '<span class="md-list_description">{{ variable.description }}</span>' +
            '</div>',
});

var vm = new Vue({
  el: '#page',
  data: {
    errors: {
      user_background: false,
      user_cover: false,
    },
    status: {
      isCompiled: false,
      isCreating: false,
      isFileLoading: true,
      isNotify: false,
    },
    support: {
      copy: true,
      file: false,
    },
    text: {
      fileLoading: 'Идет загрузка файлов темы...',
      notify_message: 'Идет создание темы...',
    },
    user: {
      user_id: null,
      user_background: '',
      user_cover: '',
      selected_layout: 'cover',
      selected_pallete: 'teal_orange',
      selected_scheme: 'light',
      selected_files: '{}',
      // Используется только для предпросмотра темы
      avatar: '',
      // Не сохраняются в localStorage, вычисляются после загрузки страницы
      hasPallete: false,
      hasScheme: false,
      hasFile: false,
    },
    scheme: {
      // NOTE: Порядок соответствует color_scheme
      color_background: '#FAFAFA',
      color_background_dialog: '#FFFFFF',
      color_background_secondary: '#F5F5F5',
      color_area_normal: '#EEEEEE',
      color_area_hover: '#E0E0E0',
      color_area_active: '#DDDDDD',
      color_button_hover: '#E0E0E0',
      color_border: '#DDDDDD',
      color_text_primary: '#212121',
      color_text_secondary: '#424242',
      color_text_hint: '#757575',
      color_text_disabled: '#9E9E9E',
      // NOTE: Свойства color_pallete
      color_primary: '#009688',
      color_accent: '#FFAB40',
      color_link: '#009688',
      color_link_hover: '#FFAB40',
      color_link_active: '#FF9100',
      color_header_background: '#333333',
      // NOTE: Вычисляемые свойства
      color_primary_darker: '#008478',
      color_primary_lighter: '#1FA396',
      color_text_on_primary: '#FAFAFA',
      color_text_on_accent: '#212121',
      color_border_hover: '#C2C2C2',
      color_header_background_shade: '#2D2D2D',
      color_header_text: '#FAFAFA',
    },
    file_list: [],
    color_pallete: {},
    color_scheme: {},
    variables: {},
  },
  watch: {
    "scheme.color_primary": function () {
      if (this.scheme.color_primary.length === 7) {
        this.scheme.color_text_on_primary = isLight(hexToRgb(this.scheme.color_primary)) ? '#212121' : '#FAFAFA';
        this.scheme.color_primary_darker = additionColor(this.scheme.color_primary, '#000000', 12);
        this.scheme.color_primary_lighter = additionColor(this.scheme.color_primary, '#FFFFFF', 12);
      }
    },
    "scheme.color_accent": function () {
      if (this.scheme.color_accent.length === 7) {
        this.scheme.color_text_on_accent = isLight(hexToRgb(this.scheme.color_accent)) ? '#212121' : '#FAFAFA';
      }
    },
    "scheme.color_border": function () {
      if (this.scheme.color_border.length === 7) {
        this.scheme.color_border_hover = additionColor(this.scheme.color_border, '#000000', 12);
      }
    },
    "scheme.color_header_background": function () {
      if (this.scheme.color_header_background.length === 7) {
        this.scheme.color_header_background_shade = additionColor(this.scheme.color_header_background, '#000000', 12);
        this.scheme.color_header_text = isLight(hexToRgb(this.scheme.color_header_background)) ? '#212121' : '#FAFAFA';
      }
    },
    "user.selected_layout": function () {
      for (var i = 0; i < this.file_list.length; i++) {
        if (this.file_list[i]['url'] == 'profile-cover.sass') {
          this.file_list[i].checked = this.user.selected_layout == 'cover' ? true : false;
        }
      }

      this.saveLocal('selected_layout', this.user.selected_layout);
      this.saveSelectedFiles();
    },
  },
  methods: {
    setId: function () {
      var str = this.user.user_id;
      if ( ~this.user.user_id.indexOf(".") ) {
        this.user.avatar = this.user.user_id;
        str = this.user.user_id.substring(this.user.user_id.indexOf("/users/x") + 8);
        str = str.substr(0, str.indexOf("."));
        str = str.substr(str.indexOf("/") + 1);
      }
      str = parseInt(str);
      this.user.user_id = isNaN(str) ? '' : str;
      this.saveLocal('user_id', this.user.user_id);
    },
    /**
     * Загрузка набора цветов из палитры/схемы в текущий набор цветов
     * @param  {string} type 'pallete' or 'scheme'
     * @param  {string} x    'custom' – special settings
     */
    loadColorSet: function (type, x) {
      var user_color = 'selected_' + type;
      var current_color = 'color_' + type;
      var x = x === 'custom' ? x : this.user[user_color];

      for (var key in this[current_color][x]['colors']) {
        this.scheme[key] = this[current_color][x]['colors'][key];
      }

      this.saveLocal(user_color, this.user[user_color]);
    },
    changeColorSet: function (type) {
      var template;

      template = this['color_' + type]['custom']['colors']; // this.color_scheme.['custom']['colors']

      if (this.user['selected_' + type] !== 'custom') {
        this.user['has' + wordCapitlize(type)] = true;
        this.user['selected_' + type] = 'custom';
      }

      for (var key in template) {
        template[key] = this.scheme[key];
      }

      this.saveLocal('custom_' + type, JSON.stringify(template));
    },
    changeFiles: function (name, value) {
      if (name && value) {
        for (var i = 0; i < this.file_list.length; i++) {
          if (this.file_list[i]['cat'] == name && i !== value) this.file_list[i]['checked'] = false;
        }
      }
      this.saveSelectedFiles();
    },
    checkImage: function (e) {
      var img, type, image;

      type = e.target.id;
      image = e.target.value;

      if (image) {
        img = new Image();
        img.onload = function() {
          vm.errors[type] = false;
        }
        img.onerror = function() {
          vm.errors[type] = true;
        }
        img.src = image;
      } else {
        vm.errors[type] = false;
      }

      this.saveLocal(type, image);
    },
    createTheme: function () {
      switchDisabled(document.getElementById('create_css'));
      document.getElementById('output_css').value = '';
      this.status.isCreating = true;
      this.status.isNotify = true;



      var sass_setting = '';
      var user_setting;



      for (var key in this.scheme) {
        sass_setting += '$' + key + ': ' + this.scheme[key] + '; ';
      }

      if (this.user.user_id)                    sass_setting += '$id: ' + this.user.user_id + '; ';
      if (this.user.selected_layout == 'cover') sass_setting += '$image-cover: url(' + this.user.user_cover + '); ';
      if (this.user.user_background) {
        sass_setting += '$image-background: url(' + this.user.user_background + '); '
      } else {
        sass_setting += '$image-background: none; '
      };



      if (user_sass) {
        user_sass.compile(sass_setting + user_css, function callback(result) {
          console.log('Статус компиляции пользовательского стиля:', result.status);
          if (result.status === 0) {
            user_setting = shikiCssAdaptation(result.text);
          } else {
            console.error('В процессе компиляции пользовательского стиля произошла ошибка:', result);
          }
        });
      }



      var baseImport = '';
      var compileFileList = this.getFilelist('checked');
      for (var i = 0; i < compileFileList.length; i++) {
        baseImport += '@import "' + compileFileList[i] + '"; ';
      }



      scss.writeFile('base.sass', sass_setting + baseImport);



      scss.compile('@import "base";', function(result) {
        console.log("compiled", result);
        if (result.status === 0) {
          vm.status.isCompiled = true;
          vm.status.isCreating = false;
          vm.status.isNotify = false;


          var css = shikiCssAdaptation(result.text);
          css += vm.user.hasFile ? user_setting ? user_setting : user_css : '';
          document.getElementById('output_css').value = css;


          switchDisabled(document.getElementById('create_css'));
        } else {
          vm.status.isCreating = false;
          vm.text.notify_message = 'Произошла ошибка, попробуйте в следующий раз.';
        }
      });
    },
    getFilelist: function (key) {
      var filelist = key === 'object' ? {} : [];
      for (var i = 0; i < this.file_list.length; i++) {
        switch (key) {
          case 'object':
            filelist[this.file_list[i]['url']] = this.file_list[i]['checked'];
            break;
          case 'checked':
            if (this.file_list[i][key]) filelist.push(this.file_list[i]['url']);
            break;
          default:
            filelist.push(this.file_list[i][key]);
            break;
        }
      }
      return filelist;
    },
    copyTheme: function () {
      document.getElementById('output_css').select();
      document.execCommand('copy');
    },
    readUserFile: function (event) {
      if (!event.target.files.length) {
        user_sass = undefined;
        user_css = undefined;
        vm.user.hasFile = false;
        return;
      }

      var file  = event.target.files[0],
          reader = new FileReader(),
          ex     = getExtension(file.name);

      // Closure to capture the file information.
      reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) {
          if (ex == 'sass' || ex == 'scss') {
            console.log('Загруженный файл будет преобразован препроцессором Sass и добавлен в конец стиля.');

            user_sass = new Sass();

            user_sass.options({
              style: Sass.style.expanded,
              indentedSyntax: ex == 'sass' ? true : false,
            });

            user_css = evt.target.result;
            vm.user.hasFile = true;
          } else if (ex == 'css' && file.type == 'text/css') {
            console.log('Загружен css-файл. Он будет добавлен в конец стиля без изменений.');

            user_css = evt.target.result;
            vm.user.hasFile = true;
          }
        }
      };

      reader.readAsText(file, 'UTF-8');
    },
    saveLocal: function (key, value) {
      localStorage.setItem(key, value);
    },
    // Скачивание своих настроек
    // NOTE: возможно, потребуется дать разрешение на скачивание в браузере
    getMySettings: function () {
      // Подготавливаем данные
      this.user.custom_pallete = this.color_pallete[this.user.selected_pallete].colors;
      this.user.custom_scheme = this.color_scheme[this.user.selected_scheme].colors;

      // Создаём файл
      var json = JSON.stringify(this.user, null, 2);
      var blob = new Blob([json], {type: "application/json"});
      var url  = URL.createObjectURL(blob);

      // Создаём элемент
      var link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'shiki-theme-settings.json');

      // Подделываем клик по элементу
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
      link.dispatchEvent(event);
    },
    loadUserPallete: function () {
      // TODO: delete on next update
      // Временный вариант для поддержки палитр в массивах
      if (localStorage.getItem('user_pallete') !== null) {
        var user_pallete = JSON.parse(localStorage.getItem('user_pallete'));

        if (Array.isArray(user_pallete)) {
          this.color_pallete['custom']['colors'].color_primary           = user_pallete[0];
          this.color_pallete['custom']['colors'].color_accent            = user_pallete[1];
          this.color_pallete['custom']['colors'].color_link              = user_pallete[2];
          this.color_pallete['custom']['colors'].color_link_hover        = user_pallete[3];
          this.color_pallete['custom']['colors'].color_link_active       = user_pallete[4];
          this.color_pallete['custom']['colors'].color_header_background = user_pallete[5];

          // Меняем старую запись на новую
          this.saveLocal('custom_pallete', JSON.stringify(this.color_pallete['custom']['colors']));
          localStorage.removeItem('user_pallete');

          this.user.hasPallete = true;
        }
      }

      // Проверяем localStorage на наличие custom_pallete. Если есть, то загружаем массив и отображаем кнопку для переключения.
      if (localStorage.getItem('custom_pallete') !== null) {
        var user_pallete = JSON.parse(localStorage.getItem('custom_pallete'));

        if (typeof user_pallete === 'object') {
          for (var key in user_pallete) {
            this.color_pallete['custom']['colors'][key] = user_pallete[key];
          }

          this.user.hasPallete = true;
        }
      }

      this.loadColorSet('pallete', this.user.selected_pallete);
    },
    loadUserScheme: function () {
      if (localStorage.getItem('custom_scheme') !== null) {
        var user_scheme = JSON.parse(localStorage.getItem('custom_scheme'));

        if (typeof user_scheme === 'object') {
          for (var key in user_scheme) {
            this.color_scheme['custom']['colors'][key] = user_scheme[key];
          }

          this.user.hasScheme = true;
        }
      }

      this.loadColorSet('scheme', this.user.selected_scheme);
    },
    saveSelectedFiles: function () {
      this.saveLocal('selected_files', JSON.stringify(this.getFilelist('object')));
    },
    updateSelectedFiles: function () {
      var x = JSON.parse(this.user.selected_files);
      for (var i = 0; i < this.file_list.length; i++) {
        if (x.hasOwnProperty(this.file_list[i].url)) {
          this.file_list[i].checked = x[this.file_list[i].url];
        }
      }
    },
  },
  mounted: function () {
    // Загружаем настройки пользователя
    var localSettings = [
      'user_id',
      'user_cover',
      'user_background',
      'selected_layout',
      'selected_pallete',
      'selected_scheme',
      'selected_files',
    ];

    for (var i = 0; i < localSettings.length; i++) {
      var x = localStorage.getItem(localSettings[i]);
      if (x !== null) this.user[localSettings[i]] = x;
    }


    // Проверяем поддержку копирования в буфер
    if (document.queryCommandSupported('copy')) {
      this.support.copy = false;
    }

    // Проверяем поддержку чтения локальных файлов
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      this.support.file = true;
    }


    // Подготовка сборщика
    Sass.setWorkerUrl('./vendor/sass.js/sass.worker.min.js');
    scss = new Sass();

    scss.options({
      style: Sass.style.expanded,
      indentedSyntax: true,
    });


    // Загрузка списка цветовых схем
    XHR('./config/theme_schemes.json', function(config) {
      vm.color_scheme = JSON.parse(config);
      vm.loadUserScheme();
    });

    // Загрузка списка цветовых палитр
    XHR('./config/theme_palletes.json', function(config) {
      vm.color_pallete = JSON.parse(config);
      vm.loadUserPallete();
    });

    // Загрузка списка переменных
    XHR('./config/theme_variables.json', function(config) {
      vm.variables = JSON.parse(config);
    });

    XHR('./config/theme_files.json', function(files) {
      vm.file_list = JSON.parse(files);
      scss.preloadFiles('../../assets/', '', vm.getFilelist('url'), function callback() {
        // Запускается по окончанию процесса вне зависимости от успешности предзагрузки.
        vm.status.isFileLoading = false;
        vm.updateSelectedFiles();
        switchDisabled(document.getElementById('create_css'));
      });
    });
  },
});


var scss;
var user_sass;
var user_css;


function shikiCssAdaptation (css) {
  var css = css ? css : '@charset "UTF-8"; ';
  if (css.substring(0, 17) == '@charset "UTF-8";') {
    css = css.slice(18);
  }
  css = css.replace('data:image', 'data\\:image');
  css = css.replace(/\/\*\*\//g, '');
  return css;
}


function switchDisabled(elem) {
  if (elem.hasAttribute('disabled')) {
    elem.removeAttribute('disabled');
  } else {
    elem.setAttribute('disabled', 'disabled');
  }
}


function XHR (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;
    if (xhr.status == 200) {
      callback(xhr.responseText);
    }
  }
  xhr.send();
}


document.addEventListener('click', function () {
  if (event.clientX === 0 && event.clientY === 0 && event.screenX === 0) {
    return false;
  }
  if (event.target.nodeName.toUpperCase() === 'INPUT' && event.target.type.toUpperCase() === 'RADIO' || 
      event.target.nodeName.toUpperCase() === 'INPUT' && event.target.type.toUpperCase() === 'CHECKBOX') {
    document.activeElement.blur();
  }
});


/**
 * Get file extension from its name
 * @fname  {string}   File name
 * @return {string}   File extension
 * Author: VisioN (https://stackoverflow.com/a/12900504)
 */
function getExtension (fname) {
  return fname.slice((fname.lastIndexOf(".") - 1 >>> 0) + 2);
}

function wordCapitlize (word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}


function isLight (r, g, b) {
  b = r[2];
  g = r[1];
  r = r[0];
  var a = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return (a < 0.5);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

function additionColor (c1, c2, o2) {
  var i,
      c1 = hexToRgb(c1),
      c2 = hexToRgb(c2),
      o2 = o2 / 100,
      r = [];

  for (i = 0; i < 3; i++) {
    r.push(calcColor(c1[i], c2[i], o2));
  }

  r = rgbToHex(r[0], r[1], r[2]);

  return r;

  function calcColor (c1, c2, o2) {
    return Math.round((c2 * o2) + (1 - o2) * c1);
  }
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
}

/**
 * Color contrast script for http://webaim.org/resources/contrastchecker/
 * Authored by Jared Smith.
 * Nothing here is too earth shattering, but if you're reading this,
 * you must be interested.
 * Feel free to steal, borrow, or use this code however you would like.
 * The color picker is jscolor - http://jscolor.com/
 */
function checkcontrast(background, color) {

  var L1 = getL(color.substring(1));
  var L2 = getL(background.substring(1));
  
  if (L1 !== false && L2 !== false) {

    var ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    console.info('Contrast Ratio Test Result', (Math.round(ratio * 100) / 100) + ":1");

    if (ratio >= 7) {
      console.info('Normal AAA', 'Pass');
    } else {
      console.info('Normal AAA', 'Fail');
    }

    if (ratio >= 4.5) {
      console.info('Normal AA', 'Pass');
      console.info('Big AAA', 'Pass');
    } else {
      console.info('Normal AA', 'Fail');
      console.info('Big AAA', 'Fail');
    }

    if (ratio >= 3) {
      console.info('Big AA', 'Pass');
      return ratio;
    } else {
      console.info('Big AA', 'Fail');
      return ratio;
    }
  } else {
    console.info('Contrast Ratio Test', 'Fail');
    return false;
  }

  function getL(color) {
    if(color.length == 3) {
      var R = getsRGB(color.substring(0,1) + color.substring(0,1));
      var G = getsRGB(color.substring(1,2) + color.substring(1,2));
      var B = getsRGB(color.substring(2,3) + color.substring(2,3));
      update = true;
    } else if (color.length == 6) {
      var R = getsRGB(color.substring(0,2));
      var G = getsRGB(color.substring(2,4));
      var B = getsRGB(color.substring(4,6));
      update = true;
    } else {
      update = false;
    }

    if (update == true) {
      var L = (0.2126 * R + 0.7152 * G + 0.0722 * B);
      return L;
    } else {
      return false;
    }
  }

  function getsRGB(color) {
    color = getRGB(color);
    if(color !== false) {
      color = color / 255;
      color = (color <= 0.03928) ? color/12.92 : Math.pow(((color + 0.055)/1.055), 2.4);
      return color;
    } else {
      return false;
    }
  }

  function getRGB(color) {
    try {
      var color = parseInt(color, 16);
    } catch (err) {
      var color = false;
    }

    return color;
  }
}