Vue.component('filelist', {
  props: ['file_list'],
  template: '<div class="md-container">' +
              '<file v-for="(file, index) in file_list"' +
                'v-on:input="changeState" ' +
                'v-bind:file="file" ' +
                'v-bind:index="index" ' +
                'v-bind:key="index">' +
              '</file>' +
            '</div>',
  methods: {
    changeState: function (x, checked) {
      for (var i = 0; i < this.file_list.length; i++) {
        if (x == i) {
          if (this.file_list[i]['cat']) {
            for (var j = 0; j < this.file_list.length; j++) {
              if (this.file_list[j]['cat'] == this.file_list[i]['cat']) this.file_list[j]['checked'] = false;
            }
          }
          this.file_list[i]['checked'] = checked;
        }
      }
    },
  },
});

Vue.component('file', {
  props: ['file', 'index'],
  template: '<label class="md-list md-control">' +
              '<input ' +
                'v-on:change="onChange($event)" ' +
                'v-bind:type="file.cat ? \'radio\' : \'checkbox\'" ' +
                'v-bind:name="file.cat ? \'file-\' + file.cat : \'file-\' + index " ' +
                'v-bind:checked="file.checked ? \'checked\' : \'\'" ' +
                'v-bind:disabled="file.disabled">' +
              '<span v-bind:class="file.cat ? \'md-radio\' : \'md-checkbox\'"></span>' +
              '<span>{{ file.title ? file.title : file.url }}</span>' +
              '<div class="md-list_description" v-if="file.description">{{ file.description }}</div>' +
            '</label>',
  methods: {
    onChange: function ($event) {
      this.$emit('input', this.index, $event.target.checked);
    },
  },
});

var vm = new Vue({
  el: '#page',
  data: {
    // TODO: delete next six variables after rewrite next 'to do'
    user_setting: {
      pallete: 'teal_orange',
      scheme: 'light',
      custom_pallete: false,
      custom_scheme: false,
    },
    cover_display: true,
    scheme_dark: false,
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
    file_list: [
      {
        'url': 'version.sass',
        'disabled': true,
        'checked': true,
      },
      {
        'url': 'copyright.sass',
        'disabled': true,
        'checked': true,
      },
      {
        'url': 'font-arial.sass',
        'cat': 'font',
        'checked': true,
      },
      {
        'url': 'font-roboto.sass',
        'cat': 'font',
        'checked': false,
      },
      {
        'url': 'color.sass',
        'checked': true,
      },
      {
        'url': 'main.sass',
        'checked': true,
      },
      {
        'url': 'menu-classic.sass',
        'checked': true,
      },
      {
        'url': 'dashboard-layout.sass',
        'checked': true,
      },
      {
        'url': 'users-list.sass',
        'checked': true,
      },
      {
        'url': 'profile-content.sass',
        'checked': true,
      },
      {
        'url': 'profile-cover.sass',
        'checked': true,
        'disabled': true,
        'description': 'Этот файл зависит от настройки "Вид профиля".',
      },
      {
        'url': 'tentative.sass',
        'checked': false,
        'disabled': true,
        'description': 'В данный момент тестировать нечего.',
      },
      {
        'url': 'user-settings.sass',
        'checked': true,
      },
    ],
    user: {
      id: null,
      avatar: '',
      background: '',
      cover: '',
      color_pallete: [],
      color_scheme: [],
      has_css: false,
      // TODO: next six variables
      has_pallete: false,
      has_scheme: false,
      isCover: true,
      isDarkScheme: false,
      selected_pallete: 'teal_orange',
      selected_scheme: 'light',
    },
    // TODO: rewrite all variable
    variables: [
      // Основные цвета
      '$color-primary',
      '$color-accent',
      // Текст на фонах основных цветов
      '$color-text-on-primary',
      '$color-text-on-accent',
      // Цвета ссылок
      '$color-link',
      '$color-link-hover',
      '$color-link-active',
      // Цвета текста
      '$color-text-primary',
      '$color-text-secondary',
      '$color-text-hint',
      '$color-text-disabled',
      // Цвета меню
      '$color-header-background',
      '$color-header-background-shade',
      '$color-header-text',
      // Цвет фона
      '$color-background',
      '$color-background-dialog',
      '$color-background-secondary',
      // Вспомогательные цвета фона
      '$color-area-normal',
      '$color-area-hover',
      '$color-area-active',
      // Цвета границ
      '$color-border',
      '$color-border-hover',
      // Цвета кнопок
      '$color-button-hover',
      // ID пользователя
      '$id',
      // Ссылки на изображение
      '$image-background',
      '$image-cover',
      // Затемненная и осветленная версии основного цвета
      '$color-primary-darker',
      '$color-primary-lighter',
      // Основной и акцентирующий цвета текста на цвете фоне
      '$color-primary-on-background',
      '$color-accent-on-background',
    ],
    // TODO: delete after rewrite
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
    color_pallete: {
      standart: ['#4682B4', '#B78BC7', '#176093', '#FF5202', '#FF1402', '#333333'],
      blue_pink: ['#2196F3', '#FF4081', '#2196F3', '#FF4081', '#F50057', '#333333'],
      teal_orange: ['#009688', '#FFAB40', '#009688', '#FFAB40', '#FF9100', '#333333'],
      custom: [],
    },
    color_scheme: {
      light: ['#FAFAFA', '#FFFFFF', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#DDDDDD', '#E0E0E0', '#DDDDDD', '#212121', '#424242', '#757575', '#9E9E9E'],
      dark: ['#303030', '#424242', '#424242', '#616161', '#424242', '#212121', '#424242', '#757575', '#FFFFFF', '#EEEEEE', '#BDBDBD', '#9E9E9E'],
      custom: [],
    },
    text: {
      fileLoading: 'Идет загрузка файлов темы...',
      notify_message: 'Идет создание темы...',
    },
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
    "cover_display": function () {
      for (var i = 0; i < this.file_list.length; i++) {
        if (this.file_list[i]['url'] == 'profile-cover.sass') {
          this.file_list[i].checked = this.cover_display;
        }
      }
    },
  },
  methods: {
    setId: function () {
      var str = this.user.id;
      if ( ~this.user.id.indexOf(".") ) {
        this.user.avatar = this.user.id;
        str = this.user.id.substring(this.user.id.indexOf("/users/x") + 8);
        str = str.substr(0, str.indexOf("."));
        str = str.substr(str.indexOf("/") + 1);
      }
      str = parseInt(str);
      this.user.id =  isNaN(str) ? '' : str;
      localStorage.setItem('user_id', this.user.id);
    },
    changeScheme: function () {
      var scheme = this.scheme_dark ? 'dark' : 'light';
      var i = 0;
      for (var key in this.scheme) {
        if (this.color_scheme[scheme][i] == undefined) continue;
        this.scheme[key] = this.color_scheme[scheme][i];
        i++;
      }
    },
    changePallete: function (x) {
      x = x === 'custom' ? x : this.user_setting.pallete;

      this.scheme.color_primary = this.color_pallete[x][0];
      this.scheme.color_accent = this.color_pallete[x][1];
      this.scheme.color_link = this.color_pallete[x][2];
      this.scheme.color_link_hover = this.color_pallete[x][3];
      this.scheme.color_link_active = this.color_pallete[x][4];
      this.scheme.color_header_background = this.color_pallete[x][5];
    },
    changeColor: function () {
      if (this.user_setting.pallete !== 'custom') {
        this.user_setting.custom_pallete = true;
        this.user_setting.pallete = 'custom';
      }

      this.color_pallete['custom'][0] = this.scheme.color_primary;
      this.color_pallete['custom'][1] = this.scheme.color_accent;
      this.color_pallete['custom'][2] = this.scheme.color_link;
      this.color_pallete['custom'][3] = this.scheme.color_link_hover;
      this.color_pallete['custom'][4] = this.scheme.color_link_active;
      this.color_pallete['custom'][5] = this.scheme.color_header_background;

      localStorage.setItem('user_pallete', JSON.stringify(this.color_pallete['custom']));
    },
    createTheme: function () {
      switchDisabled(document.getElementById('copy_css'));
      document.getElementById('output_css').value = '';
      this.status.isCreating = true;
      this.status.isNotify = true;



      var sass_setting = '';
      var user_setting;



      for (var key in this.scheme) {
        sass_setting += '$' + key + ': ' + this.scheme[key] + '; ';
      }

      if (this.user.id)         sass_setting += '$id: ' + this.user.id + '; ';
      if (this.cover_display)   sass_setting += '$image-cover: url(' + this.user.cover + '); ';
      if (this.user.background) {
        sass_setting += '$image-background: url(' + this.user.background + '); '
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
          css += vm.user.has_css ? user_setting ? user_setting : user_css : '';
          document.getElementById('output_css').value = css;


          switchDisabled(document.getElementById('copy_css'));
        } else {
          vm.status.isCreating = false;
          vm.text.notify_message = 'Произошла ошибка, попробуйте в следующий раз.';
        }
      });
    },
    getFilelist: function (key) {
      var filelist = [];
      for (var i = 0; i < this.file_list.length; i++) {
        switch (key) {
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
        vm.user.has_css = false;
        return;
      }

      var file  = event.target.files[0],
          reader = new FileReader(),
          ex     = getExtension(file.name);

      // Closure to capture the file information.
      reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) {
          if (ex == 'sass' || ex == 'scss') {
            console.log('Загруженный файл будет приобразован препроцессором Sass и добавлен в конец стиля.');

            user_sass = new Sass();

            user_sass.options({
              style: Sass.style.expanded,
              indentedSyntax: ex == 'sass' ? true : false,
            });

            user_css = evt.target.result;
            vm.user.has_css = true;
          } else if (ex == 'css' && file.type == 'text/css') {
            console.log('Загружен css-файл. Он будет добавлен в конец стиля без изменений.');

            user_css = evt.target.result;
            vm.user.has_css = true;
          }
        }
      };

      reader.readAsText(file, 'UTF-8');
    },
    saveLocal: function (key, value) {
      localStorage.setItem(key, value);
    },
  },
  mounted: function () {
    if (localStorage.getItem('user_id') !== null) {
      this.user.id = localStorage.getItem('user_id');
      this.setId();
    }


    if (localStorage.getItem('user_cover') !== null) {
      this.user.cover = localStorage.getItem('user_cover');
    }


    if (localStorage.getItem('user_background') !== null) {
      this.user.background = localStorage.getItem('user_background');
    }


    // Проверяем localStorage на наличие user_pallete. Если есть, то загружаем массив и отображаем кнопку для переключения.
    if (localStorage.getItem('user_pallete') !== null) {
      var user_pallete = JSON.parse(localStorage.getItem('user_pallete'));

      if (Array.isArray(user_pallete)) {
        for (var i = 0; i < user_pallete.length; i++) {
          this.color_pallete['custom'][i] = user_pallete[i];
        }
        this.user_setting.custom_pallete = true;
        this.user_setting.pallete = 'custom';
        this.changePallete('custom');
        console.log('Информация:', 'Найдена и загружена пользовательская палитра.');
      }
    } else {
      console.log('Информация:', 'Пользовательская палитра не найдена.');
    }


    // Проверяем поддержку копирования в буфер
    if (document.queryCommandSupported('copy')) {
      this.support.copy = false;
    }


    // Проверяем поддержку чтения локальных файлов
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      this.support.file = true;
    }


    Sass.setWorkerUrl('./vendor/sass.js/sass.worker.min.js');
    scss = new Sass();


    scss.options({
      style: Sass.style.expanded,
      indentedSyntax: true,
    });


    scss.preloadFiles('../../release-stable/', '', this.getFilelist('url'), function callback() {
      // Запускается по окончанию процесса вне зависимости от успешности предзагрузки.
      vm.status.isFileLoading = false;
      switchDisabled(document.getElementById('create_css'));
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
  if (elem.getAttribute('disabled') == 'disabled') {
    elem.removeAttribute('disabled');
  } else {
    elem.setAttribute('disabled', 'disabled');
  }

  if (elem.getAttribute('aria-disabled') == 'true') {
    elem.setAttribute('aria-disabled', 'false');
  } else if (elem.getAttribute('aria-disabled') == 'false') {
    elem.setAttribute('aria-disabled', 'true');
  }

  if (elem.classList.contains('btn-disabled')) {
    elem.classList.remove('btn-disabled');
  } else if (elem.classList.contains('btn')) {
    elem.classList.add('btn-disabled');
  }
}


document.addEventListener('click', function () {
  if (event.clientX === 0 && event.clientY === 0 && event.screenX === 0) {
    return false;
  }
  if (event.target.nodeName.toUpperCase() === 'INPUT' && event.target.type.toUpperCase() === 'TEXT' || 
      event.target.nodeName.toUpperCase() === 'SELECT' || 
      event.target.nodeName.toUpperCase() === 'TEXTAREA') {

  } else {
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