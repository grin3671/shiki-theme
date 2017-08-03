var vm = new Vue({
  el: '#page',
  data: {
    theme: {
      release: 'stable',
      version: '1.2.20',
    },
    user_setting: {
      cover: true,
      dark: false,
      pallete: 'teal_orange',
      scheme: 'light',
      custom_pallete: false,
      custom_scheme: false,
    },
    isBetaRelease: false,
    isCompiled: false,
    isCopyUnsupport: true,
    isCreating: false,
    isFileLoading: true,
    isNotify: false,
    cover_display: true,
    scheme_dark: false,
    user_id: null,
    user_cover: '',
    user_avatar: '',
    user_background: '',
    extra_settings: false,
    scheme: {
      background: '#FAFAFA',
      background_dialog: '#FFFFFF',
      Grey100: '#F5F5F5',
      background_normal: '#EEEEEE',
      background_hover: '#E0E0E0',
      background_active: '#DDDDDD',
      button_hover: '#E0E0E0',
      border: '#DDDDDD',
      text_primary: '#212121',
      text_secondary: '#424242',
      text_hint: '#757575',
      text_disabled: '#9E9E9E',
      link_normal: '#009688',
      link_hover: '#FFAB40',
      link_active: '#FF9100',
      primary: '#009688',
      primaryBG_color: '#FAFAFA',
      primary_darker: '#008478',
      accent: '#FFAB40',
      accentBG_color: '#212121',
      menu_background: '#333333',
      menu_popup_background: '#2D2D2D',
    },
    color_scheme: {
      light: ['#FAFAFA', '#FFFFFF', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#DDDDDD', '#E0E0E0', '#DDDDDD', '#212121', '#424242', '#757575', '#9E9E9E'],
      dark: ['#303030', '#424242', '#424242', '#616161', '#424242', '#212121', '#424242', '#757575', '#FFFFFF', '#EEEEEE', '#BDBDBD', '#9E9E9E'],
      custom: [],
    },
    color_pallete: {
      standart: ['#4682B4', '#B78BC7', '#176093', '#FF5202', '#FF1402', '#333333'],
      blue_pink: ['#2196F3', '#FF4081', '#2196F3', '#FF4081', '#F50057', '#333333'],
      teal_orange: ['#009688', '#FFAB40', '#009688', '#FFAB40', '#FF9100', '#333333'],
      custom: [],
    },
    text: {
      fileLoading: 'Идет загрузка файлов темы...',
      notify_message: 'Идет создание темы...',
    },
    files: {
      stable: [],
      beta: [],
    },
  },
  watch: {
    "scheme.primary": function () {
      if (this.scheme.primary.length === 7) {
        this.scheme.primaryBG_color = isLight(hexToRgb(this.scheme.primary)) ? '#212121' : '#FAFAFA';
        this.scheme.primary_darker = additionColor(this.scheme.primary, '#000000', '12');
      }
    },
    "scheme.accent": function () {
      if (this.scheme.accent.length === 7) {
        this.scheme.accentBG_color = isLight(hexToRgb(this.scheme.accent)) ? '#212121' : '#FAFAFA';
      }
    },
    "scheme.menu_background": function () {
      if (this.scheme.menu_background.length === 7) {
        this.scheme.menu_popup_background = additionColor(this.scheme.menu_background, '#000000', '12');
      }
    },
  },
  methods: {
    setId: function () {
      if ( ~this.user_id.indexOf(".") ) {
        this.user_avatar = this.user_id;
        var str = this.user_id.substring(this.user_id.indexOf("/users/x") + 8);
        str = str.substr(0, str.indexOf("."));
        str = str.substr(str.indexOf("/") + 1);
        this.user_id = str;
      }
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

      this.scheme.primary = this.color_pallete[x][0];
      this.scheme.accent = this.color_pallete[x][1];
      this.scheme.link_normal = this.color_pallete[x][2];
      this.scheme.link_hover = this.color_pallete[x][3];
      this.scheme.link_active = this.color_pallete[x][4];
      this.scheme.menu_background = this.color_pallete[x][5];
    },
    changeColor: function () {
      if (this.user_setting.pallete !== 'custom') {
        this.user_setting.custom_pallete = true;
        this.user_setting.pallete = 'custom';
      }

      // TODO: Перед записью проверить на совпадение цветов. Если отличий больше одного спросить про перезапись. Если необходимо - отменить перезапись.
      // TODO: Сделать запись цветов в localStorage
      this.color_pallete['custom'][0] = this.scheme.primary;
      this.color_pallete['custom'][1] = this.scheme.accent;
      this.color_pallete['custom'][2] = this.scheme.link_normal;
      this.color_pallete['custom'][3] = this.scheme.link_hover;
      this.color_pallete['custom'][4] = this.scheme.link_active;
      this.color_pallete['custom'][5] = this.scheme.menu_background;

      localStorage.setItem('user_pallete', JSON.stringify(this.color_pallete['custom']));
    },
    createTheme: function () {
      switchDisabled(document.getElementById('copy_css'));
      document.getElementById('output_css').value = '';
      this.isCreating = true;
      this.isNotify = true;

      Sass.setWorkerUrl('./vendor/sass.js/sass.worker.min.js');
      var sass = new Sass();

      sass.options({
        // Treat source_string as SASS (as opposed to SCSS)
        style: Sass.style.expanded,
        indentedSyntax: true,
      }, function callback() {
        // invoked without arguments when operation completed
      });

      var sass_setting = '';

      for (var key in this.scheme) {
        sass_setting += '$' + key + ': ' + this.scheme[key] + '; ';
      }

      if (this.cover_display) {
        sass_setting += '$id: ' + this.user_id + '; ';
        sass_setting += '$cover: url(' + this.user_cover + '); ';
      }

      sass.writeFile('_version.sass', this.files[this.theme.release][8]);
      sass.writeFile('main.sass', this.files[this.theme.release][3]);
      sass.writeFile('copyright.sass', this.files[this.theme.release][0]);
      sass.writeFile('font.sass', this.files[this.theme.release][1]);
      sass.writeFile('color.sass', this.files[this.theme.release][2]);

      if (this.cover_display) {
        sass.writeFile('profile-cover.sass', this.files[this.theme.release][4]);
        sass.writeFile('settings-cover.sass', this.files[this.theme.release][5]);
      } else {
        sass.writeFile('profile-cover.sass', '');
        sass.writeFile('settings-cover.sass', '');
      }

      if (this.user_background) {
        sass_setting += '$user_background: url(' + this.user_background + '); ';
        sass.writeFile('settings-body.sass', 'body {background-attachment: fixed; background-image: $user_background; background-position: top center; background-size: 100%;}');
      } else {
        sass.writeFile('settings-body.sass', 'body { background-image: none; }');
      }

      sass.writeFile('base.sass', sass_setting + '@import "_version.sass"; @import "copyright"; @import "font"; @import "color"; @import "main";');
      sass.writeFile('cover.sass', '@import "profile-cover"');
      sass.writeFile('tentative.sass', this.files[this.theme.release][7]);
      sass.writeFile('user-settings.sass', this.files[this.theme.release][6]);

      sass.compile('@import "base"; @import "cover"; @import "tentative"; @import "user-settings";', function(result) {
        console.log("compiled", result);
        if (result.status === 0) {
          vm.isCompiled = true;
          vm.isCreating = false;
          vm.isNotify = false;


          var css = result.text;
          css = css.slice(18);
          css = css.replace('data:image', 'data\\:image');
          css = css.replace(/\/\*\*\//g, '');
          document.getElementById('output_css').value = css;


          switchDisabled(document.getElementById('copy_css'));
        } else {
          vm.isCreating = false;
          vm.text.notify_message = 'Произошла ошибка, попробуйте в следующий раз.';
        }
      });
    },
    copyTheme: function () {
      document.getElementById('output_css').select();
      document.execCommand('copy');
    },
  },
  mounted: function () {
    // Проверяем localhost на наличие user_pallete. Если есть, то загружаем массив и отображаем кнопку для переключения.
    if (localStorage.getItem('user_pallete') !== null) {
      var user_pallete = JSON.parse(localStorage.getItem('user_pallete'));

      if (Array.isArray(user_pallete)) {
        for (var i = 0; i < user_pallete.length; i++) {
          this.color_pallete['custom'][i] = user_pallete[i];
        }
        this.user_setting.custom_pallete = true;
        console.log('Информация:', 'Найдена и загружена пользовательская палитра.');
      }
    } else {
      console.log('Информация:', 'Пользовательская палитра не найдена.');
    }

    // Проверяем поддержку копирования в буфер
    if (document.queryCommandSupported('copy')) {
      this.isCopyUnsupport = false;
    }

    // Загружаем файлы темы..
    var fileList = [
      '/copyright.sass',
      '/font.sass',
      '/color.sass',
      '/main.sass',
      '/profile-cover.sass',
      '/settings-cover.sass',
      '/user-settings.sass',
      '/tentative.sass',
      '/version.sass'
    ];
    var fileLoaded = {
      stable: 0,
      beta: 0,
    };
    var hash = Date.now();

    fileLoader('stable');

    function fileLoader (release) {
      for (var i = 0; i < fileList.length; i++) {
        XHR(i, release, './release-' + release + fileList[i] + '?' + hash, Loading);
      }
    }

    function XHR (i, release, url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        if (xhr.status == 200) {
          callback(i, release, xhr.responseText);
        }
      }
      xhr.send();
    }

    function Loading(i, release, response) {
      fileLoaded[release]++;
      vm.files[release][i] = response;
      if (fileList.length === fileLoaded[release]) {
        console.log('Загрузка файлов:', 'Ветка ' + release + ' загружена.' + '(' + fileLoaded[release] + ')');
        if (vm.isFileLoading) {
          vm.isFileLoading = false;
          switchDisabled(document.getElementById('create_css'));
          fileLoader('beta');
        }
        if (fileList.length === fileLoaded['beta']) {
          vm.isBetaRelease = true;
        }
      }
    }
  },
});



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
 * Nothing here is too earth shattering, but if you're reading this, you must be interested. Feel free to steal, borrow, or use this code however you would like.
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