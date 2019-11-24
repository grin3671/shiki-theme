/**
 * Сборщик shiki-builder
 * Инструмент для сборки shiki-theme для сайта shikimori.one
 * https://github.com/grin3671/shiki-theme
 * MIT License
 * Copyright (c) 2017 grin3671
 */

'use strict';

Vue.component('palette-preview', {
  props: ['color'],
  template: '<div class="palette_preview" :style="{ backgroundColor: color[0], color: color[1] }">' +
              '<slot></slot>' +
            '</div>',
});

Vue.component('color-preview', {
  props: ['value', 'palette', 'background', 'text'],
  computed: {
    color: function () {
      return this.$root.variables[this.palette];
    },
    readability: function () {
      return tinycolor.readability(this.background, this.value).toFixed(1);
    },
    colorText: function () {
      return tinycolor.mostReadable(this.value, ["#fff", "#000"]).toHexString();
    },
    backgroundColor: function () {
      return this.text ? this.value : this.background;
    },
    textColor: function () {
      return this.text ? this.text == 'auto' ? tinycolor.mix(this.backgroundColor, tinycolor(this.backgroundColor).isLight() ? '#000' : '#fff', 87).toHexString() : this.text : this.value;
    },
  },
  template: '<div class="color_preview" :style="{ backgroundColor: backgroundColor, color: textColor }" @click="open()">' +
              '<div class="md-icon color_visibility" v-if="!text" :class="{ color_warning: readability < 4 }">' +
                '<span :style="{ color: colorText }">{{ readability }}</span>' +
              '</div>' +
              '<span class="palette_name">{{ text ? color.name : \'Цвет текста\' }}</span>' +
              '<code v-if="palette || text">{{ value }}</code>' +
              // '<input type="color" :value="value" @input="$emit(\'input\', $event.target.value)">' +
              '<span class="color_options">' +
                '<slot></slot>' +
              '</span>' +
            '</div>',
  methods: {
    open: function () {
      this.$root.openColorPicker(this.palette);
    },
  },
});


Vue.component('color-picker', {
  props: ['value'],
  mounted: function () {
    // Сохранение значений цвета для палитры hsv
    this.HueH = tinycolor(this.value).toHsv().h;
    this.posX = tinycolor(this.value).toHsv().s;
    this.posY = tinycolor(this.value).toHsv().v;
  },
  data: function () {
    return {
      HueH: 0,
      posX: 0,
      posY: 0,
    }
  },
  computed: {
    currentColor: {
      get: function () {
        return tinycolor.fromRatio({h: this.HueH, s: this.posX, v: this.posY}).toHexString();
      },
      set: function (color) {
        var c = tinycolor(color);
        var x = color.replace('#', '');
        if (c.isValid() && c.getFormat() == 'hex' && x.length == 6) {
          c = c.toHsv();
          this.HueH = c.h;
          this.posX = c.s;
          this.posY = c.v;
        }
      },
    },
    rgb_output: {
      get: function () {
        return tinycolor.fromRatio({h: this.HueH, s: this.posX, v: this.posY}).toRgbString();
      },
      set: function (color) {
        var c = tinycolor(color);
        if (c.isValid() && c.getFormat() == 'rgb') {
          c = c.toHsv();
          this.HueH = c.h;
          this.posX = c.s;
          this.posY = c.v;
        }
      },
    },
    hsv_output: {
      get: function () {
        return tinycolor.fromRatio({h: this.HueH, s: this.posX, v: this.posY}).toHsvString();
      },
      set: function (color) {
        var c = tinycolor(color);
        if (c.isValid() && c.getFormat() == 'hsv') {
          c = c.toHsv();
          this.HueH = c.h;
          this.posX = c.s;
          this.posY = c.v;
        }
      },
    },
    hsl_output: {
      get: function () {
        return tinycolor.fromRatio({h: this.HueH, s: this.posX, v: this.posY}).toHslString();
      },
      set: function (color) {
        var c = tinycolor(color);
        if (c.isValid() && c.getFormat() == 'hsl') {
          c = c.toHsv();
          this.HueH = c.h;
          this.posX = c.s;
          this.posY = c.v;
        }
      },
    },
    hue_bg: function () {
      return 'hsl(' + this.HueH + ', 100%, 50%)';
    },
    hue_left: function () {
      return this.toPCT(this.HueH / 360);
    },
    color_text: function () {
      return tinycolor.mix(this.currentColor, tinycolor(this.currentColor).isLight() ? '#000' : '#fff', 87).toHexString();
    },
    style: function () {
      return {
        x: this.posX * 100 + '%',
        y: (100 - this.posY * 100) + '%',
      }
    },
  },
  template: '<div class="backdrop">' +
              '<form action="/" @submit.prevent="select()" @reset.prevent="close()" class="modal color-picker">' +
                '<input id="picker_pallete" type="radio" name="picker" value="pallete" checked>' +
                '<input id="picker_pipette" type="radio" name="picker" value="pipette">' +
                '<input id="picker_helper" type="radio" name="picker" value="helper">' +
                '<div class="color-picker__header">' +
                  '<label for="picker_pallete"><i class="material-icons">gradient</i><span>Палитра</span></label>' +
                  '<label for="picker_pipette"><i class="material-icons">colorize</i><span>Пипетка</span></label>' +
                  '<label for="picker_helper"><i class="material-icons">assistant</i><span>Помощь</span></label>' +
                '</div>' +
                '<div class="color-picker__slide">' +
                  '<div class="color-picker__pallete" ref="pallete" :style="{ backgroundColor: hue_bg }" ' +
                    '@mousedown="handleMouseDown" ' +
                    '@touchmove="handleChange" ' +
                    '@touchstart="handleChange" ' +
                    '@contextmenu.stop.prevent ' +
                    '>' +
                    '<div class="color-picker__point" :style="{ top: style.y, left: style.x }"></div>' +
                  '</div>' +
                  '<div class="color-picker__block">' +
                    '<input type="range" v-model="HueH" min="0" max="360">' +
                    '<div class="color-picker__slider hue_bg" value="240" max="360">' +
                      '<div class="color-picker__slider-thumb" :style="{ left: hue_left }"></div>' +
                    '</div>' +
                  '</div>' +
                  '<hr>' +
                  '<div class="color-picker__block clearfix">' +
                    '<div style="display: flex">' +
                      '<div class="picker_preview" :style="{ backgroundColor: currentColor, color: color_text }">' +
                        '<span>{{ currentColor }}</span>' +
                      '</div>' +
                      '<div>' +
                        '<div class="md-input fullwidth">' +
                          '<input type="text" v-model="currentColor">' +
                          '<div class="md-divider"></div>' +
                        '</div>' +
                        '<div class="md-input fullwidth">' +
                          '<input type="text" v-model.lazy="rgb_output">' +
                          '<div class="md-divider"></div>' +
                        '</div>' +
                        '<div class="md-input fullwidth">' +
                          '<input type="text" v-model.lazy="hsl_output">' +
                          '<div class="md-divider"></div>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
                '<div class="color-picker__footer">' +
                  '<button type="reset">Отмена</button>' +
                  '<button type="submit">Сохранить</button>' +
                '</div>' +
              '</form>' +
            '</div>',
  methods: {
    toPCT: function (n) {
      return Math.floor(n * 100) + '%';
    },
    handleChange: function (e, skip) {
      !skip && e.preventDefault();
      var container = this.$refs.pallete;
      var containerWidth = container.clientWidth;
      var containerHeight = container.clientHeight;
      var xOffset = container.getBoundingClientRect().left + window.pageXOffset;
      var yOffset = container.getBoundingClientRect().top + window.pageYOffset;
      var pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
      var pageY = e.pageY || (e.touches ? e.touches[0].pageY : 0);
      var left = pageX - xOffset;
      var top = pageY - yOffset;
      if (left < 0) {
        left = 0;
      } else if (left > containerWidth) {
        left = containerWidth;
      }
      if (top < 0) {
        top = 0;
      } else if (top > containerHeight) {
        top = containerHeight;
      }

      // Результаты работы палитры HSV
      this.posX = left / containerWidth;
      this.posY = -(top / containerHeight) + 1;
    },
    handleMouseDown: function (e) {
      // this.handleChange(e, true)
      window.addEventListener('mousemove', this.handleChange);
      window.addEventListener('mouseup', this.handleChange);
      window.addEventListener('mouseup', this.handleMouseUp);
    },
    handleMouseUp: function (e) {
      window.removeEventListener('mousemove', this.handleChange);
      window.removeEventListener('mouseup', this.handleChange);
      window.removeEventListener('mouseup', this.handleMouseUp);
    },
    close: function () {
      this.$emit('close');
    },
    select: function () {
      this.$emit('select', this.currentColor);
    },
  },
});


Vue.component('palette-select', {
  props: ['value', 'options'],
  data: function () {
    return {
      state: false,
    }
  },
  computed: {
    selected: function () {
      return this.value;
    },
  },
  template: '<div class="md-select">' +
              '<div class="md-select_trigger" :class="{ active: state }" @click="open()">' +
                '<theme-list :theme="options[selected]"></theme-list>' +
              '</div>' +
              '<div class="md-list" v-if="state">' +
                '<theme-list v-for="(option, index) in options" ' +
                  ':theme="option" ' +
                  ':index="index" ' +
                  ':key="index" ' +
                  ':selected="selected" ' +
                  '@select="select($event)" ' +
                  '></theme-list>' +
              '</div>' +
            '</div>',
  mounted: function () {
    // Закрыть окно выбора при клике снаружи
    document.addEventListener('click', this.close);
    this.$el.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  },
  methods: {
    close: function () {
      this.state = false;
    },
    open: function (theme) {
      this.state = this.state ? !1 : !0;
    },
    select: function (theme) {
      this.state = false;
      this.$emit('input', theme);
    },
  },
});


Vue.component('theme-list', {
  props: ['theme', 'selected', 'index'],
  template: '<div class="md-select_container" @click="click($event)" :class="{ selected: selected === index }">' +
              '<div class="theme-preview">' +
                '<div class="theme-preview--primary" :style="{ backgroundColor: theme.palette.color_primary }"></div>' +
                '<div class="theme-preview--accent" :style="{ backgroundColor: theme.palette.color_accent }"></div>' +
              '</div>' +
              '<div class="theme-info">' +
                '<div class="title">{{ theme.title }}</div>' +
                '<div class="info">Палитра от <span>{{ theme.author }}</span></div>' +
              '</div>' +
            '</div>',
  methods: {
    click: function () {
      this.$emit('select', this.index);
    },
  },
});

var instances = {};

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
      isBranchLoaded: false,
    },
    support: {
      copy: true,
      file: false,
    },
    text: {
      fileLoading: 'Загрузка файлов…',
      notify_message: 'Создание темы…',
    },
    user: {
      user_id: null,
      user_background: '',
      user_cover: '',
      selected_layout: 'cover',
      selected_palette: 'light',
      selected_files: '{}',
      selected_imports: [
        'main.css',
        'profile-cover.css',
        'font-roboto.css',
        'profile-update.1.css',
        'profile-update.1.1.css',
      ],
      // Используется только для предпросмотра темы
      avatar: '',
      // Не сохраняются в localStorage, вычисляются после загрузки страницы
      hasPalette: false,
      hasScheme: false,
      hasFile: false,
      selected_branch: 'master',
    },
    customTheme: {
      palette: {},
      helpers: [
        'autoMainText',
        'autoLinks',
        'autoMenuBg',
        'autoMain',
        'autoMenu',
        'autoScheme',
      ],
    },
    builderData: {
      theme: {

      },
      imports: {

      },
      helpers: {
        autoMainText: {
          name: 'Текст на основных цветах',
          desc: 'Цвет текста на элементах основного и акцентирующего цвета.',
        },
        autoLinks: {
          name: 'Ссылки',
          desc: 'Цвета копируются из основных цветов. Ссылка при нажатии затемняется.',
        },
        autoMenuBg: {
          name: 'Фон меню',
          desc: 'Цвет копируется из «Диалоги» для соответствия цветов областей на мобильном экране.',
        },
        autoMain: {
          name: 'Зависящие от основных',
          desc: 'Осветлённые и затемнённые основные цвета для эффектов наведения, нажатия и пр.',
          disabled: true,
        },
        autoMenu: {
          name: 'Цвета внутри меню',
          desc: 'Цвет текста, иконок, фона при наведении и прочего.',
          disabled: true,
        },
        autoScheme: {
          name: 'Прочие цвета схемы',
          desc: 'Различные цвета текстов, иконок, границ, фоны «Поверхностей», «Диалогов» и пр.',
          disabled: true,
        },
      }
    },
    scheme: {
      // NOTE: Порядок соответствует color_scheme
      color_background: '#FAFAFA',
      color_background_dialog: '#FFFFFF',
      color_surface: '#EEEEEE',
      color_surface_hover: '#E0E0E0',
      color_surface_active: '#DDDDDD',
      color_border: '#DDDDDD',
      color_text_primary: '#212121',
      color_text_secondary: '#424242',
      color_text_hint: '#757575',
      color_text_disabled: '#9E9E9E',
      // NOTE: Свойства color_palette
      color_primary: '#009688',
      color_accent: '#FFAB40',
      color_link: '#009688',
      color_link_hover: '#FFAB40',
      color_link_active: '#FF9100',
      color_menu_background: '#333333',
      // NOTE: Вычисляемые свойства
      color_text_on_primary: '#FAFAFA',
      color_text_on_accent: '#212121',
    },
    folders: [],
    file_list: [],
    branches: {},
    color_palette: {},
    color_scheme: {},
    variables: {},
    theme: {
      branches: ['master'],
    },
    colorPicker: {
      state: 0, // open or close
      color: '#009688', // v-model
      palette: 'color_primary', // link to variables
    }
  },
  watch: {
    "user.selected_imports": function () {
      if (this.user.selected_imports.indexOf('profile-cover.css') == -1) {
        this.user.selected_layout = 'simple';
      } else {
        this.user.selected_layout = 'cover';
      }
    },
  },
  computed: {
    // Текст
    color_text_primary: {
      get: function () {
        return this.customTheme.helpers.includes('autoScheme') ? this.getMixedColor(this.color_background, 87) : this.scheme.color_text_primary;
      },
      set: function (color) {
        this.scheme.color_text_primary = color;
      }
    },
    color_text_secondary: {
      get: function () {
        return this.customTheme.helpers.includes('autoScheme') ? this.getMixedColor(this.color_background, 68) : this.scheme.color_text_secondary;
      },
      set: function (color) {
        this.scheme.color_text_secondary = color;
      }
    },
    color_text_hint: {
      get: function () {
        return this.customTheme.helpers.includes('autoScheme') ? this.getMixedColor(this.color_background, 54) : this.scheme.color_text_hint;
      },
      set: function (color) {
        this.scheme.color_text_hint = color;
      }
    },
    color_text_disabled: {
      get: function () {
        return this.customTheme.helpers.includes('autoScheme') ? this.getMixedColor(this.color_background, 38) : this.scheme.color_text_disabled;
      },
      set: function (color) {
        this.scheme.color_text_disabled = color;
      }
    },
    color_overlay_text_hovered: function () {
      return tinycolor(this.color_text_primary).setAlpha(.04).toRgbString();
    },
    color_overlay_text_selected: function () {
      return tinycolor(this.color_text_primary).setAlpha(.08).toRgbString();
    },
    color_overlay_text_pressed: function () {
      return tinycolor(this.color_text_primary).setAlpha(.12).toRgbString();
    },
    // Ссылки
    color_link: {
      get: function () {
        return this.customTheme.helpers.includes('autoLinks') ? this.color_primary : this.scheme.color_link;
      },
      set: function (color) {
        this.scheme.color_link = color;
      }
    },
    color_link_hover: {
      get: function () {
        return this.customTheme.helpers.includes('autoLinks') ? this.color_accent : this.scheme.color_link_hover;
      },
      set: function (color) {
        this.scheme.color_link_hover = color;
      }
    },
    color_link_active: {
      get: function () {
        return this.customTheme.helpers.includes('autoLinks') ? tinycolor(this.color_accent).darken(12).toString() : this.scheme.color_link_active;
      },
      set: function (color) {
        this.scheme.color_link_active = color;
      }
    },
    // Основной
    color_primary: {
      get: function () {
        return this.scheme.color_primary;
      },
      set: function (color) {
        this.scheme.color_primary = color;
      }
    },
    color_text_on_primary: {
      get: function () {
        return this.customTheme.helpers.includes('autoMainText') ? this.getMixedColor(this.color_primary, 87) : this.scheme.color_text_on_primary;
      },
      set: function (color) {
        this.scheme.color_text_on_primary = color;
      }
    },
    color_primary_reduced: {
      get: function () {
        return this.customTheme.helpers.includes('autoMain') ? tinycolor.mix(this.color_background, this.color_primary, 72).toHexString() : this.scheme.color_primary_reduced;
      },
      set: function (color) {
        this.scheme.color_primary_reduced = color;
      }
    },
    color_primary_hovered: {
      get: function () {
        return this.customTheme.helpers.includes('autoMain') ? tinycolor.mix(this.color_primary, '#fff', 8).toHexString() : this.scheme.color_primary_hovered;
      },
      set: function (color) {
        this.scheme.color_primary_hovered = color;
      }
    },
    color_primary_pressed: {
      get: function () {
        return this.customTheme.helpers.includes('autoMain') ? tinycolor.mix(this.color_primary, '#000', 4).toHexString() : this.scheme.color_primary_pressed;
      },
      set: function (color) {
        this.scheme.color_primary_pressed = color;
      }
    },
    color_overlay_primary_hovered: function () {
      return tinycolor(this.color_primary).setAlpha(.08).toRgbString();
    },
    color_overlay_primary_selected: function () {
      return tinycolor(this.color_primary).setAlpha(.12).toRgbString();
    },
    color_overlay_primary_pressed: function () {
      return tinycolor(this.color_primary).setAlpha(.16).toRgbString();
    },
    // Акцентирующий
    color_accent: {
      get: function () {
        return this.scheme.color_accent;
      },
      set: function (color) {
        this.scheme.color_accent = color;
      }
    },
    color_text_on_accent: {
      get: function () {
        return this.customTheme.helpers.includes('autoMainText') ? this.getMixedColor(this.color_accent, 87) : this.scheme.color_text_on_accent;
      },
      set: function (color) {
        this.scheme.color_text_on_accent = color;
      }
    },
    color_accent_reduced: {
      get: function () {
        return this.customTheme.helpers.includes('autoMain') ? tinycolor.mix(this.color_background, this.color_accent, 72).toHexString() : this.scheme.color_accent_reduced;
      },
      set: function (color) {
        this.scheme.color_accent_reduced = color;
      }
    },
    color_accent_fade: {
      get: function () {
        return this.customTheme.helpers.includes('autoMain') ? tinycolor.mix(this.color_background, this.color_accent, 48).toHexString() : this.scheme.color_accent_fade;
      },
      set: function (color) {
        this.scheme.color_accent_fade = color;
      }
    },
    color_overlay_accent_hovered: function () {
      return tinycolor(this.color_accent).setAlpha(.08).toRgbString();
    },
    color_overlay_accent_selected: function () {
      return tinycolor(this.color_accent).setAlpha(.12).toRgbString();
    },
    color_overlay_accent_pressed: function () {
      return tinycolor(this.color_accent).setAlpha(.16).toRgbString();
    },
    // Фоновые цвета
    color_background: {
      get: function () {
        return this.scheme.color_background;
      },
      set: function (color) {
        this.scheme.color_background = color;
      }
    },
    color_background_translucent: function () {
      return tinycolor(this.color_background).setAlpha(.9).toRgbString();
    },
    color_background_dialog: {
      get: function () {
        return this.customTheme.helpers.includes('autoScheme') ? tinycolor(this.color_background).lighten(5).toHexString() : this.scheme.color_background_dialog;
      },
      set: function (color) {
        this.scheme.color_background_dialog = color;
      }
    },
    color_surface: {
      get: function () {
        return this.customTheme.helpers.includes('autoScheme') ? tinycolor.mix(this.color_background, this.color_text_primary, 5).toHexString() : this.scheme.color_surface;
      },
      set: function (color) {
        this.scheme.color_surface = color;
      }
    },
    color_surface_hover: {
      get: function () {
        return this.customTheme.helpers.includes('autoScheme') ? this.getMixedColor(this.color_surface, tinycolor(this.color_background).isDark() ? 8 : 4) : this.scheme.color_surface_hover;
      },
      set: function (color) {
        this.scheme.color_surface_hover = color;
      }
    },
    color_surface_active: {
      get: function () {
        return this.customTheme.helpers.includes('autoScheme') ? this.getMixedColor(this.color_surface, tinycolor(this.color_background).isDark() ? 12 : 8) : this.scheme.color_surface_active;
      },
      set: function (color) {
        this.scheme.color_surface_active = color;
      }
    },
    color_border: {
      get: function () {
        return this.customTheme.helpers.includes('autoScheme') ? this.getMixedColor(this.color_background, 12) : this.scheme.color_border;
      },
      set: function (color) {
        this.scheme.color_border = color;
      }
    },
    // Цвета меню
    color_menu_background: {
      get: function () {
        return this.customTheme.helpers.includes('autoMenuBg') ? this.color_background_dialog : this.scheme.color_menu_background;
      },
      set: function (color) {
        this.scheme.color_menu_background = color;
      }
    },
    color_menu_background_fade: function () {
      return tinycolor(this.color_menu_background).setAlpha(.48).toRgbString();
    },
    color_menu_text_primary: {
      get: function () {
        return this.customTheme.helpers.includes('autoMenu') ? this.getMixedColor(this.color_menu_background, 87) : this.scheme.color_menu_text_primary;
      },
      set: function (color) {
        this.scheme.color_menu_text_primary = color;
      }
    },
    color_menu_text_disabled: {
      get: function () {
        return this.customTheme.helpers.includes('autoMenu') ? this.getMixedColor(this.color_menu_background, 38) : this.scheme.color_menu_text_disabled;
      },
      set: function (color) {
        this.scheme.color_menu_text_disabled = color;
      }
    },
    color_menu_icon: {
      get: function () {
        return this.customTheme.helpers.includes('autoMenu') ? this.getMixedColor(this.color_menu_background, 76) : this.scheme.color_menu_icon;
      },
      set: function (color) {
        this.scheme.color_menu_icon = color;
      }
    },
    color_menu_search: {
      get: function () {
        return this.customTheme.helpers.includes('autoMenu') ? this.getMixedColor(this.color_menu_background, 12) : this.scheme.color_menu_search;
      },
      set: function (color) {
        this.scheme.color_menu_search = color;
      }
    },
    color_menu_search_fade: function () {
      return tinycolor(this.color_menu_text_primary).setAlpha(.12).toRgbString();
    },
    color_menu_background_hover: {
      get: function () {
        return this.customTheme.helpers.includes('autoMenu') ? this.getMixedColor(this.color_menu_background, tinycolor(this.color_menu_background).isDark() ? 8 : 4) : this.scheme.color_menu_background_hover;
      },
      set: function (color) {
        this.scheme.color_menu_background_hover = color;
      }
    },
    color_menu_background_active: {
      get: function () {
        return this.customTheme.helpers.includes('autoMenu') ? this.getMixedColor(this.color_menu_background, tinycolor(this.color_menu_background).isDark() ? 12 : 8) : this.scheme.color_menu_background_active;
      },
      set: function (color) {
        this.scheme.color_menu_background_active = color;
      }
    },
    // Цвета кнопок списков
    color_planned: function () {
      return this.customTheme.helpers.includes('autoScheme') ? tinycolor.mix(this.color_background, '#76d6ff', 32).toHexString() : this.sheme.color_planned;
    },
    color_onhold: function () {
      return this.customTheme.helpers.includes('autoScheme') ? tinycolor.mix(this.color_background, '#9e9e9e', 32).toHexString() : this.sheme.color_onhold;
    },
    color_watching: function () {
      return this.customTheme.helpers.includes('autoScheme') ? tinycolor.mix(this.color_background, '#76d6ff', 24).toHexString() : this.sheme.color_watching;
    },
    color_rewatching: function () {
      return this.customTheme.helpers.includes('autoScheme') ? this.color_watching : this.sheme.color_rewatching;
    },
    color_completed: function () {
      return this.customTheme.helpers.includes('autoScheme') ? tinycolor.mix(this.color_background, '#c6e97f', 24).toHexString() : this.sheme.color_completed;
    },
    color_dropped: function () {
      return this.customTheme.helpers.includes('autoScheme') ? tinycolor.mix(this.color_background, '#ef5350', 24).toHexString() : this.sheme.color_dropped;
    },
  },
  methods: {
    openColorPicker: function (palette) {
      // console.log(palette, this[palette], this.variables[palette].name);
      this.colorPicker.palette = palette;
      this.colorPicker.color = tinycolor(this[palette]).toHexString();
      this.colorPicker.state = 1;
    },
    closeColorPicker: function () {
      this.colorPicker.state = 0;
    },
    selectColorPicker: function (color) {
      this.closeColorPicker();
      this[this.colorPicker.palette] = color;
    },
    getMixedColor: function (color, amount) {
      return tinycolor.mix(color, tinycolor(color).isLight() ? '#000' : '#fff', amount).toHexString();
    },
    setColor: function (type, color) {
      if (color == 'invert') {
        var oldColor = tinycolor(this.scheme[type]).toHsl();
        var newValue = (Math.abs((oldColor.l * 100) - 100) / 100);
        color = tinycolor.fromRatio({ h: oldColor.h, s: oldColor.s, l: newValue }).toHexString();
      }
      this.scheme[type] = color;
      this.saveCustomTheme();
    },
    setId: function () {
      // Вырезает из адреса аватарки ID пользователя
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
    setLayout: function (value) {
      // Когда пользователь меняет вид профиля удаляем или добавляем css-файл
      var i = this.user.selected_imports.indexOf('profile-cover.css');
      switch (value) {
        case 'cover':
          if (i < 0) this.user.selected_imports.push('profile-cover.css');
          break;
        case 'simple':
          if (i) this.user.selected_imports.splice(i, 1);
          break;
      }
      this.saveLocal('selected_layout', value);
      this.saveImports();
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
      let isSassBuilder = this.user.hasPatreonAccount;
      let output_newcss = '';
      if (isSassBuilder) {
        // 
      } else {
        // Если пользователь ничего не менял в файлах то делаем импорт файлов
        let import_url = '@import url(https://shiki-theme.web.app/import/';

        // Чтобы сохранить порядок подключения файлов
        var arr = this.builderData.imports;
        var keys = Object.keys(arr);
        var selected = keys.filter(file => this.user.selected_imports.indexOf(file) != -1);
        selected.forEach(function(file, index) {
          output_newcss += '/* ' + arr[file].title + ' */\n';
          output_newcss += import_url + file + ');\n';
        });

        // 
        if (this.user.selected_palette != 'custom') {
          output_newcss += '/* Тема «' + this.color_palette[this.user.selected_palette].title + '» */\n';
          output_newcss += import_url + 'theme-' + this.user.selected_palette.replace(/-/g, '_') + '.css);\n';
          output_newcss += '\n/* Настройки переменных темы */\n@media{:root {\n';
        } else {
          // Конвертировать переменные из этого скрипта в css-переменные
          output_newcss += '\n/* Настройки переменных темы */\n@media{:root {\n';

          var arr = this.$options.computed;
          var currentCategory = '';
          Object.keys(arr).forEach(function(color, index) {
            var value = arr[color].get ? arr[color].get.call(vm) : arr[color].call(vm);
            var categoryName = currentCategory == vm.variables[color].block ? '' : '  /* ' + vm.variables[color].block + ' */\n';
            currentCategory = vm.variables[color].block;
            output_newcss += categoryName + '  --' + color.replace(/_/g, '-') + ': ' + value + ';\n';
          });

          output_newcss += '\n';
        }

        output_newcss += '  /* Обложка профиля */\n'
        output_newcss += '  --user-cover: url(' + this.user.user_cover + ');\n';
        output_newcss += '  /* Фон сайта */\n'
        output_newcss += '  --user-background: ' + (this.user.user_background ? 'url(' + this.user.user_background + ');\n' : 'none;\n');
        // Закрыть root
        output_newcss += '}}\n';

        // Свойства обложки
        if (this.user.selected_layout == 'cover') {
          output_newcss += '\n/* Моя обложка в профиле */\n';
          if (this.user.user_id) {
            output_newcss += '.p-profiles .profile-head[data-user-id="' + this.user.user_id + '"]::before {\n';
          } else {
            output_newcss += '.p-profiles .profile-head::before {\n';
          }
          output_newcss += '  display: block; /* Отображение обложки */\n';
          output_newcss += '  background-position: center 50%;\n';
          output_newcss += '}\n';
        }

        vm.status.isCompiled = true;

        document.getElementById('output_css').value = output_newcss;
      }
    },
    copyTheme: function () {
      document.getElementById('output_css').select();
      document.execCommand('copy');
    },
    saveLocal: function (key, value) {
      localStorage.setItem(key, value);
    },
    saveImports: function () {
      this.saveLocal('selected_imports', JSON.stringify(this.user.selected_imports));
    },
    // Скачивание своих настроек
    // NOTE: возможно, потребуется дать разрешение на скачивание в браузере
    getMySettings: function () {
      // Подготавливаем данные
      this.user.custom_palette = this.color_palette[this.user.selected_palette].colors;
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
    getCurrentPalette: function () {
      let obj = {};
      let arr = this.$options.computed;
      Object.keys(arr).forEach(function(item, index) {
        if (arr[item].get) obj[item] = arr[item].get.call(vm);
      });
      return obj;
    },
    saveCustomTheme: function (theme) {
      var newTheme = {},
          localThemes = {};

      // Собираем текущие цвета темы из computed-свойств
      newTheme = this.createCustomTheme(theme);
      // Устанавливаем цвета в список палитр
      if (this.customTheme.helpers.length != this.defaultHelpers().length) newTheme.helpers = this.customTheme.helpers;
      if (this.color_palette.custom) this.color_palette[newTheme.value] = newTheme;

      // Создаём еще одну вложенность для сохранения
      localThemes[newTheme.value] = newTheme;

      // Сохраняем тему
      this.saveLocal('custom_theme', JSON.stringify(localThemes));


      if (this.user.selected_palette == 'custom') return;
      this.$set(this.color_palette, newTheme.value, newTheme);
      this.user.selected_palette = newTheme.value;
      this.selectTheme(newTheme.value);
    },
    createCustomTheme: function (theme) {
      var localTheme = typeof theme == 'object';
      // Создать новую запись в списке, если её еще нет
      var newTheme = {};
      newTheme.title = localTheme ? theme.title : 'Моя тема';
      newTheme.value = localTheme ? theme.value : 'custom';
      newTheme.author = localTheme ? theme.author : 'id' + this.user.user_id;
      newTheme.helpers = localTheme ? theme.helpers : null;
      newTheme.palette = localTheme ? theme.palette : this.getCurrentPalette();
      return newTheme;
    },
    loadUserTheme: function () {
      // Если в локальных настройках есть темы, то добавляем их в список тем
      if (localStorage.getItem('custom_theme') !== null) {
        // Список тем в локальных настройках
        var localThemeList = JSON.parse(localStorage.getItem('custom_theme'));
        // Список тем, загруженных в скрипт.
        var vuejsThemeList = this.color_palette;

        for (var theme in localThemeList) {
          // Если имена совпадают — пропускаем.
          if (!vuejsThemeList.hasOwnProperty(theme)) this.$set(vuejsThemeList, theme, localThemeList[theme]);
        }
      }
      this.selectTheme(this.user.selected_palette);
      this.status.isFileLoading = false;
    },
    selectTheme: function (theme) {
      this.saveLocal('selected_palette', theme);
      this.loadThemeSet(this.color_palette[theme] ? theme : 'light');
    },
    loadThemeSet: function (theme) {
      var theme = this.color_palette[theme];
      for (var key in theme.palette) {
        // Устанавливаем значения computed-свойств из палитры
        this[key] = theme.palette[key];
      }
      // Если в теме не используются хелперы — отключаем
      if (theme.helpers) {
        this.customTheme.helpers = theme.helpers;
      // Если в теме нет хелперов — значит всё включаем
      } else {
        this.customTheme.helpers = this.defaultHelpers();
      }
    },
    saveCustomHelpers: function () {
      if (this.user.selected_palette !== 'custom') return;
      if (localStorage.getItem('custom_theme') !== null) {
        var localThemeList = JSON.parse(localStorage.getItem('custom_theme'));
        localThemeList[this.user.selected_palette].helpers = this.customTheme.helpers.length == this.defaultHelpers().length ? null : this.customTheme.helpers;
        this.saveLocal('custom_theme', JSON.stringify(localThemeList));
      }
    },
    defaultHelpers: function () {
      // Восстановить значения по умолчанию
      return [
        'autoMainText',
        'autoLinks',
        'autoMenuBg',
        'autoMain',
        'autoMenu',
        'autoScheme',
      ];
    },
  },
  mounted: function () {
    // Загружаем настройки пользователя
    var localSettings = [
      'user_id',
      'user_cover',
      'user_background',
      'selected_layout',
      'selected_palette',
      'selected_imports',
    ];

    for (var i = 0; i < localSettings.length; i++) {
      var x = localStorage.getItem(localSettings[i]);
      if (x !== null) {
        if (x[0] == '{' || x[0] == '[') x = JSON.parse(x);
        this.$set(this.user, localSettings[i], x);
      }
    }


    // Проверяем поддержку копирования в буфер
    if (document.queryCommandSupported('copy')) {
      this.support.copy = false;
    }

    // Проверяем поддержку чтения локальных файлов
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      this.support.file = true;
    }


    // Загрузка списка переменных
    XHR('./config/theme_variables.json', function(config) {
      vm.variables = JSON.parse(config);
    });


    // Загрузка списка тем
    XHR('./config/theme_list.json', function(config) {
      vm.$set(vm, 'color_palette', JSON.parse(config));
      // Загружаем темы пользователя
      Vue.nextTick(function () {
        vm.loadUserTheme();
      });
    });


    // Список файлов для импорта
    XHR('./config/theme_imports.json', function(files) {
      vm.builderData.imports = JSON.parse(files);
    });


    // Включение кнопки
    switchDisabled(document.getElementById('create_css'));
  },
});


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


function XHR (url, callback, error) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;
    if (xhr.status == 200) {
      callback(xhr.responseText);
    } else {
      if (error) error(xhr.statusText);
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
 * Get file extension from filename
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
