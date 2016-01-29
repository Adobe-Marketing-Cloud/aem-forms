(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var $, Affix, Plugin;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Affix = (function() {
  Affix.VERSION = '1.0.0';

  Affix.RESET = 'is-affixed is-affixed-top is-affixed-bottom';

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  };

  function Affix(element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options);
    this.$target = $(this.options.target).on('scroll.axa.affix.data-api', $.proxy(this.checkPosition, this)).on('click.axa.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this));
    this.$element = $(element);
    this.affixed = null;
    this.unpin = null;
    this.pinnedOffset = null;
    this.checkPosition();
  }

  Affix.prototype.getState = function(scrollHeight, height, offsetTop, offsetBottom) {
    var colliderHeight, colliderTop, initializing, position, scrollTop, targetHeight;
    scrollTop = this.$target.scrollTop();
    position = this.$element.offset();
    targetHeight = this.$target.height();
    if (offsetTop !== null && this.affixed === 'top') {
      if (scrollTop < offsetTop) {
        return 'top';
      } else {
        return false;
      }
    }
    if (this.affixed === 'bottom') {
      if (offsetTop !== null) {
        if (scrollTop + this.unpin <= position.top) {
          return false;
        } else {
          return 'bottom';
        }
      }
      if (scrollTop + targetHeight <= scrollHeight - offsetBottom) {
        return false;
      } else {
        return 'bottom';
      }
    }
    initializing = this.affixed === null;
    colliderTop = initializing ? scrollTop : position.top;
    colliderHeight = initializing ? targetHeight : height;
    if (offsetTop !== null && colliderTop <= offsetTop) {
      return 'top';
    }
    if (offsetBottom !== null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) {
      return 'bottom';
    }
    return false;
  };

  Affix.prototype.getPinnedOffset = function() {
    var position, scrollTop;
    if (this.pinnedOffset) {
      return this.pinnedOffset;
    }
    this.$element.removeClass(Affix.RESET).addClass('is-affixed');
    scrollTop = this.$target.scrollTop();
    position = this.$element.offset();
    return (this.pinnedOffset = position.top - scrollTop);
  };

  Affix.prototype.checkPositionWithEventLoop = function() {
    return setTimeout($.proxy(this.checkPosition, this), 1);
  };

  Affix.prototype.checkPosition = function() {
    var affix, affixType, e, height, offset, offsetBottom, offsetTop, scrollHeight;
    if (!this.$element.is(':visible')) {
      return;
    }
    height = this.$element.height();
    offset = this.options.offset;
    offsetTop = offset.top;
    offsetBottom = offset.bottom;
    scrollHeight = $('body').height();
    if (typeof offset !== 'object') {
      offsetBottom = offsetTop = offset;
    }
    if (typeof offsetTop === 'function') {
      offsetTop = offset.top(this.$element);
    }
    if (typeof offsetBottom === 'function') {
      offsetBottom = offset.bottom(this.$element);
    }
    affix = this.getState(scrollHeight, height, offsetTop, offsetBottom);
    if (this.affixed !== affix) {
      if (this.unpin !== null) {
        this.$element.css('top', '');
      }
      affixType = 'is-affixed' + (affix ? '-' + affix : '');
      e = $.Event(affixType + '.axa.affix');
      this.$element.trigger(e);
      if (e.isDefaultPrevented()) {
        return;
      }
      this.affixed = affix;
      if (affix === 'bottom') {
        this.unpin = this.getPinnedOffset();
      } else {
        this.unpin = null;
      }
      this.$element.removeClass(Affix.RESET).addClass(affixType).trigger(affixType.replace('affix', 'affixed') + '.axa.affix');
    }
    if (affix === 'bottom') {
      return this.$element.offset({
        top: scrollHeight - height - offsetBottom
      });
    }
  };

  return Affix;

})();

Plugin = function(option) {
  return this.each(function() {
    var $this, data, options;
    $this = $(this);
    data = $this.data('axa.affix');
    options = typeof option === 'object' && option;
    if (!data) {
      $this.data('axa.affix', (data = new Affix(this, options)));
    }
    if (typeof option === 'string') {
      return data[option]();
    }
  });
};

$.fn.affix = Plugin;

$.fn.affix.Constructor = Affix;

$(window).on('load', function() {
  return $('[data-spy="affix"]').each(function() {
    var $spy, data;
    $spy = $(this);
    data = $spy.data();
    data.offset = data.offset || {};
    if (data.offsetBottom !== null) {
      data.offset.bottom = data.offsetBottom;
    }
    if (data.offsetTop !== null) {
      data.offset.top = data.offsetTop;
    }
    return Plugin.call($spy, data);
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
(function (global){
var $, Autocomplete, Plugin;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Autocomplete = (function() {
  function Autocomplete(element, options) {
    this.element = element;
    this.$element = $(element);
    this.options = $.extend({}, options);
    this.filtered = this.options.source;
    if (this.filtered == null) {
      this.filtered = [];
    }
    this.value = '';
    this.isMouseOver = false;
    this.$dropdown = $('<div class="autocomplete__suggestions"></div>');
    this.$dropdown.hide();
    this.$element.after(this.$dropdown);
    this.$element.on('keyup', this, function(event) {
      return event.data.filter(event);
    });
    this.$element.on('blur', this, function(event) {
      if (!event.data.isMouseOver) {
        return event.data.$dropdown.hide();
      }
    });
  }

  Autocomplete.prototype.filter = function(event) {
    var i, len, ref, text;
    if (this.value !== this.element.value) {
      this.value = this.element.value;
      this.filtered = (function() {
        var i, len, ref, results;
        ref = this.options.source;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          text = ref[i];
          if (text.indexOf(this.value) > -1) {
            results.push(text);
          }
        }
        return results;
      }).call(this);
      this.$dropdown.empty();
      ref = this.filtered;
      for (i = 0, len = ref.length; i < len; i++) {
        text = ref[i];
        this.$dropdown.append(this.createItem(text));
      }
      return this.$dropdown.show();
    }
  };

  Autocomplete.prototype.createItem = function(text) {
    var item;
    item = $('<div class="autocomplete__suggestions__item">' + text + '</div>');
    item.on('mouseover', this, function(event) {
      event.data.isMouseOver = true;
      return $(event.target).addClass('autocomplete__suggestions__item--selected');
    });
    item.on('mouseout', this, function(event) {
      event.data.isMouseOver = false;
      return $(event.target).removeClass('autocomplete__suggestions__item--selected');
    });
    item.on('click', this, function(event) {
      return event.data.selectItem(event);
    });
    return item;
  };

  Autocomplete.prototype.selectItem = function(event) {
    this.element.value = event.target.textContent;
    return this.$dropdown.hide();
  };

  return Autocomplete;

})();

Plugin = function(option) {
  var params;
  params = arguments;
  return this.each(function() {
    var $this, data, options;
    options = $.extend({}, data, typeof option === 'object' && option);
    $this = $(this);
    data = $this.data('axa.autocomplete');
    if (!data) {
      data = new Autocomplete(this, options);
      return $this.data('axa.autocomplete', data);
    }
  });
};

$.fn.autocomplete = Plugin;

$.fn.autocomplete.Constructor = Autocomplete;

$(window).on('load', function() {
  return $('[data-autocomplete]').each(function() {
    var $autocomplete;
    $autocomplete = $(this);
    return Plugin.call($autocomplete);
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
var $, Autogrow, Plugin;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Autogrow = (function() {
  function Autogrow(element, options) {
    this.element = element;
    this.$element = $(element);
    this.options = $.extend({}, options);
    this.init();
  }

  Autogrow.prototype.init = function() {
    this.minHeight = this.$element.height();
    this.shadow = $('<div></div>');
    this.shadow.css({
      position: 'absolute',
      top: -10000,
      left: -10000,
      width: this.$element.width(),
      'font-size': this.$element.css('font-size'),
      'font-family': this.$element.css('font-family'),
      'font-weight': this.$element.css('font-weight'),
      'line-height': this.$element.css('line-height'),
      resize: 'none',
      'word-wrap': 'break-word'
    });
    this.shadow.appendTo(document.body);
    this.$element.on('change keyup keydown', this, function(event) {
      return event.data.update(event);
    });
    return $(window).resize(this.update);
  };

  Autogrow.prototype.update = function(event) {
    var newHeight, val;
    ({
      times: function(string, number) {
        var r;
        r = '';
        while (num -= 1) {
          r += string;
        }
        return r;
      }
    });
    if (this.element) {
      val = this.element.value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;').replace(/\n$/, '<br/>&nbsp;').replace(/\n/g, '<br/>').replace(/\s{2,}/g, function(space) {
        return times('&nbsp;', space.length - 1) + ' ';
      });
      if ((event != null) && (event.data != null) && event.data.event === 'keydown' && event.keyCode === 13) {
        val += '<br />';
      }
      this.shadow.css('width', this.$element.width());
      this.shadow.html(val);
      newHeight = Math.max(this.shadow.height(), this.minHeight);
      return this.$element.height(newHeight);
    }
  };

  return Autogrow;

})();

Plugin = function(option) {
  var params;
  params = arguments;
  return this.each(function() {
    var $this, data;
    $this = $(this);
    data = $this.data('axa.autogrow');
    if (!data) {
      data = new Autogrow(this);
      return $this.data('axa.autogrow', data);
    }
  });
};

$.fn.autogrow = Plugin;

$.fn.autogrow.Constructor = Autogrow;

$(window).on('load', function() {
  return $('[data-autogrow="autogrow"]').each(function() {
    var $autogrow;
    $autogrow = $(this);
    return Plugin.call($autogrow);
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
(function (global){
var $, Checkbox, Plugin,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Checkbox = (function() {
  Checkbox.DEFAULTS;

  function Checkbox(element, options) {
    this.setCheckboxState = bind(this.setCheckboxState, this);
    this.handleKeyUp = bind(this.handleKeyUp, this);
    this.$element = $(element);
    this.$checkbox = this.$element.find('.checkbox__checkbox');
    this.$label = this.$element.find('.checkbox__label');
    this.options = $.extend({}, Checkbox.DEFAULTS, options);
    this.init();
  }

  Checkbox.prototype.init = function() {
    this.$checkbox.attr('tabindex', '-1');
    this.$label.attr('tabindex', '0');
    this.$element.addClass('checkbox--js');
    this.setCheckboxState();
    this.$checkbox.on('change', this.setCheckboxState);
    return this.$label.on('keyup', this.handleKeyUp);
  };

  Checkbox.prototype.handleKeyUp = function(e) {
    if (e.which === 32) {
      e.preventDefault();
      this.$checkbox.prop('checked', !(this.$checkbox.is(':checked')));
      return this.$checkbox.change();
    }
  };

  Checkbox.prototype.setCheckboxState = function() {
    if (this.$checkbox.is(':checked')) {
      return this.$element.addClass('is-active');
    } else {
      return this.$element.removeClass('is-active');
    }
  };

  return Checkbox;

})();

Plugin = function(option) {
  var params;
  params = arguments;
  return this.each(function() {
    var $this, data, options;
    $this = $(this);
    options = $.extend({}, Checkbox.DEFAULTS, data, typeof option === 'object' && option);
    data = $this.data('axa.checkbox');
    if (!data) {
      data = new Checkbox(this, options);
      return $this.data('axa.checkbox', data);
    }
  });
};

$.fn.checkbox = Plugin;

$.fn.checkbox.Constructor = Checkbox;

$(window).on('load', function() {
  return $('[data-checkbox]').each(function() {
    var $checkbox, data;
    $checkbox = $(this);
    data = $checkbox.data();
    return Plugin.call($checkbox, data);
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
(function (global){
var $, Datepicker, Emitter, Picker, Plugin, append, moment,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

moment = (typeof window !== "undefined" ? window['moment'] : typeof global !== "undefined" ? global['moment'] : null);

Emitter = (function() {
  function Emitter() {
    this.emit = bind(this.emit, this);
    this.on = bind(this.on, this);
    this.events = {
      select: []
    };
  }

  Emitter.prototype.on = function(eventName, cb) {
    return this.events[eventName].push(cb);
  };

  Emitter.prototype.emit = function(eventName) {
    var fx, i, len, ref, results;
    ref = this.events[eventName];
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      fx = ref[i];
      results.push(fx.apply(null, Array.prototype.slice.call(arguments, 1)));
    }
    return results;
  };

  return Emitter;

})();

append = function(html, $parent) {
  var $el;
  $el = $(html);
  $parent.append($el);
  return $el;
};

Picker = (function(superClass) {
  extend(Picker, superClass);

  function Picker(moment1, displayWeek1, icons1) {
    var weekdays;
    this.moment = moment1;
    this.displayWeek = displayWeek1;
    this.icons = icons1;
    Picker.__super__.constructor.apply(this, arguments);
    this.date = this.moment();
    this.$element = $('<div class="picker" ></div>');
    if (this.displayWeek) {
      this.$element.addClass('picker--with-weeknumber');
    }
    this.$header = append('<div class="picker__header" ></div>', this.$element);
    this.$prev = append('<div class="picker__prev"></div>', this.$header);
    this.$prev.append(this.createIcon('prev'));
    this.$prev.on('click', this.onPrevClick.bind(this));
    this.$next = append('<div class="picker__next"></div>', this.$header);
    this.$next.append(this.createIcon('next'));
    this.$next.on('click', this.onNextClick.bind(this));
    this.$headline = append('<div class="picker__headline" ></div>', this.$header);
    this.$headline__month = append('<span class="picker__headline__month" ></span>', this.$headline);
    append('<span> </span>', this.$headline);
    this.$headline__year = append('<span></span>', this.$headline);
    this.$content = append('<div class="picker__content" ></div>', this.$element);
    this.$month = append('<div class="picker__month" ></div>', this.$content);
    weekdays = moment.localeData()._weekdaysMin;
    this.$weekHeadline = append('<div class="picker__week picker__week--headline"><div class="picker__day picker__day--headline">' + weekdays[1] + '</div><div class="picker__day picker__day--headline">' + weekdays[2] + '</div><div class="picker__day picker__day--headline">' + weekdays[3] + '</div><div class="picker__day picker__day--headline">' + weekdays[4] + '</div><div class="picker__day picker__day--headline">' + weekdays[5] + '</div><div class="picker__day picker__day--headline">' + weekdays[6] + '</div><div class="picker__day picker__day--headline">' + weekdays[0] + '</div></div>', this.$month);
    if (this.displayWeek) {
      this.$weekHeadline.prepend('<div class="picker__weeknumber picker__weeknumber--headline" ></div>');
    }
    this.updateDisplay();
  }

  Picker.prototype.updateDisplay = function() {
    var $week, $weeknumber, currentMonth, dateClone, modifier, month, results;
    this.$headline__month.text(this.date.format('MMMM'));
    this.$headline__year.text(this.date.format('YYYY'));
    this.$month.empty();
    this.$month.append(this.$weekHeadline);
    dateClone = this.moment(this.date);
    month = dateClone.get('month');
    dateClone.set('date', 1);
    if (dateClone.get('day') === 0) {
      dateClone.set('day', -6);
    } else {
      dateClone.set('day', 1);
    }
    results = [];
    while (true) {
      $week = append('<div class="picker__week" ></div>', this.$month);
      if (this.displayWeek) {
        $weeknumber = $('<div class="picker__weeknumber" ></div>');
        $weeknumber.text(dateClone.get('week'));
        $week.prepend($weeknumber);
      }
      while (true) {
        modifier = null;
        currentMonth = dateClone.get('month');
        if (currentMonth < month) {
          modifier = 'picker__day--prev-month';
        } else if (currentMonth > month) {
          modifier = 'picker__day--next-month';
        }
        append(this.createDay(dateClone, modifier), $week);
        dateClone.add(1, 'days');
        if (dateClone.get('day') === 1) {
          break;
        }
      }
      if (dateClone.get('month') !== month) {
        break;
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Picker.prototype.createIcon = function(iconName) {
    var $icon, icon;
    icon = this.icons[iconName];
    if (icon == null) {
      $.error("Please define the " + iconName + " icon");
    }
    $icon = $('<svg version="1.1" xmlns="http://www.w3.org/2000/svg"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="' + icon + '" /></svg>');
    $icon.attr('class', 'picker__icon picker__icon--' + iconName);
    return $icon;
  };

  Picker.prototype.createDay = function(d, modifier) {
    var $day, date, self;
    date = this.moment(d);
    $day = $('<div class="picker__day" ></div>');
    if (modifier != null) {
      $day.addClass(modifier);
    }
    if ((this.selectedDate != null) && date.format('DD.MM.YYYY') === this.selectedDate.format('DD.MM.YYYY')) {
      $day.addClass('is-active');
    }
    if (date.format('DD.MM.YYYY') === this.moment().format('DD.MM.YYYY')) {
      $day.addClass('picker__day--today');
    }
    self = this;
    $day.text(date.get('date'));
    $day.on('click', function(e) {
      e.preventDefault();
      self.setSelectedDate(date);
      self.emit('select', date.format('DD.MM.YYYY'));
      return self.toggle();
    });
    return $day;
  };

  Picker.prototype.getDOMNode = function() {
    return this.$element;
  };

  Picker.prototype.toggle = function() {
    return this.$element.toggleClass('is-active');
  };

  Picker.prototype.setSelectedDate = function(selectedDate) {
    this.date = selectedDate;
    this.selectedDate = this.moment(selectedDate);
    return this.updateDisplay();
  };

  Picker.prototype.onPrevClick = function(e) {
    e.preventDefault();
    this.date.add(-1, 'months');
    return this.updateDisplay();
  };

  Picker.prototype.onNextClick = function(e) {
    e.preventDefault();
    this.date.add(1, 'months');
    return this.updateDisplay();
  };

  return Picker;

})(Emitter);

Datepicker = (function() {
  function Datepicker(element, moment1, input, displayWeek, icons) {
    this.moment = moment1;
    this.onChange = bind(this.onChange, this);
    this.$element = $(element);
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/(iOS|iPhone|iPad|iPod)/i) || navigator.userAgent.match(/Windows Phone/i)) {
      this.$input = $(input);
      this.$input.prop('type', 'date');
      this.$input.focus();
    } else {
      this.picker = new Picker(this.moment, displayWeek, icons);
      if (input != null) {
        this.$input = $(input);
        this.$input.on('change', this.onChange);
        this.onChange();
      }
      this.picker.on('select', (function(date) {
        this.$input.val(date);
        return this.$input.trigger('change');
      }).bind(this));
      this.$element.append(this.picker.getDOMNode());
    }
  }

  Datepicker.prototype.onChange = function() {
    var dat;
    dat = this.moment(this.$input.val(), 'DD.MM.YYYY');
    if (dat.isValid()) {
      return this.picker.setSelectedDate(dat);
    }
  };

  Datepicker.prototype.toggle = function() {
    return this.picker.toggle();
  };

  return Datepicker;

})();

Plugin = function(options) {
  var opts;
  opts = $.extend({}, $.fn.datepicker.defaults, options);
  return this.each(function() {
    var $this, data;
    $this = $(this);
    data = $this.data('axa.datepicker');
    if (!data) {
      if (opts.moment != null) {
        moment = opts.moment;
      } else if (window.moment != null) {
        moment = window.moment;
      } else {
        $.error("Moment.js must either be passed as an option or be available globally");
      }
      data = new Datepicker(this, moment, opts.input, opts.displayWeek, opts.icons);
      $this.data('axa.datepicker', data);
    }
    if (opts.action != null) {
      return data[opts.action]();
    }
  });
};

$.fn.datepicker = Plugin;

$.fn.datepicker.Constructor = Datepicker;

$(document).on('click.axa.datepicker.data-api', '[data-datepicker]', function(e) {
  var $input, $target, displayWeek, icons;
  e.preventDefault();
  $target = $($(this).data('datepicker'));
  $input = $($target.data('datepicker-watch'));
  displayWeek = $target.data('datepicker-display-week');
  icons = {
    prev: $target.data('datepicker-icon-prev'),
    next: $target.data('datepicker-icon-next')
  };
  displayWeek = displayWeek && displayWeek !== 'false';
  return Plugin.call($target, {
    input: $input,
    action: 'toggle',
    displayWeek: displayWeek,
    icons: icons
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],6:[function(require,module,exports){
(function (global){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dropdown = (function () {
  function Dropdown(element) {
    _classCallCheck(this, Dropdown);

    this.$element = (0, _jquery2.default)(element);

    this.$label = this.$element.find('[data-dropdown-label]');
    this.$text = this.$element.find('[data-dropdown-text]');
    this.$select = this.$element.find('[data-dropdown-select]');

    this.init();
  }

  _createClass(Dropdown, [{
    key: 'init',
    value: function init() {
      var _this = this;

      this.$element.attr('tabindex', '0');
      this.$select.attr('tabindex', '-1');

      this.$element.addClass('is-enhanced');
      this.$label.addClass('is-enhanced');
      this.$text.addClass('is-enhanced');
      this.$select.addClass('is-enhanced');
      this.setLabelText();

      this.$element.on('keydown', function (e) {
        return _this.handleKeyDown(e);
      });
      this.$select.on('change', function () {
        return _this.setLabelText();
      });
    }
  }, {
    key: 'handleKeyDown',
    value: function handleKeyDown(e) {
      if (e.which == 32) {
        this.$select.focus();
      }
    }
  }, {
    key: 'setLabelText',
    value: function setLabelText() {
      var value = this.$select.find('option:selected').text();
      this.$text.text(value);
    }
  }]);

  return Dropdown;
})();

function Plugin() {
  var params = arguments;

  return this.each(function () {
    var $this = (0, _jquery2.default)(this);
    var data = $this.data('axa.dropdown');

    if (!data) {
      data = new Dropdown(this);
      $this.data('axa.dropdown', data);
    }
  });
}

_jquery2.default.fn.dropdown = Plugin;
_jquery2.default.fn.dropdown.Constructor = Dropdown;

(0, _jquery2.default)(function () {
  (0, _jquery2.default)('[data-dropdown]').each(function () {
    var $dropdown = (0, _jquery2.default)(this);
    Plugin.call($dropdown);
  });
});

// Copyright AXA Versicherungen AG 2015

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
(function (global){
var $, Dropzone, Plugin;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Dropzone = (function() {
  function Dropzone(element, options) {
    this.element = element;
    this.$element = $(element);
    this.options = $.extend({}, options);
    this.init();
  }

  Dropzone.prototype.init = function() {
    this.$element.bind('dragover', this, function(event) {
      event.preventDefault();
      return event.data.$element.addClass('dropzone__container--dragover');
    });
    this.$element.bind('dragleave', this, function(event) {
      event.preventDefault();
      return event.data.$element.removeClass('dropzone__container--dragover');
    });
    return this.$element.on('drop', this, function(event) {
      event.preventDefault();
      return event.data.$element.removeClass('dropzone__container--dragover');
    });
  };

  return Dropzone;

})();

Plugin = function(option) {
  var params;
  params = arguments;
  return this.each(function() {
    var $this, data;
    $this = $(this);
    data = $this.data('axa.dropzone');
    if (!data) {
      data = new Dropzone(this);
      return $this.data('axa.dropzone', data);
    }
  });
};

$.fn.dropzone = Plugin;

$.fn.dropzone.Constructor = Dropzone;

$(window).on('load', function() {
  return $('[data-dropzone="dropzone"]').each(function() {
    var $dropzone;
    $dropzone = $(this);
    return Plugin.call($dropzone);
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
(function (global){
var $, IE9Spinner, Plugin;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

IE9Spinner = (function() {
  function IE9Spinner(element, options) {
    this.$element = $(element);
    this.$element.addClass('is-fallback-active');
  }

  return IE9Spinner;

})();

Plugin = function(option) {
  var params;
  params = arguments;
  return this.each(function() {
    var $this, action, data, options;
    options = $.extend({}, data, typeof option === 'object' && option);
    if (typeof option === 'string') {
      action = option;
    }
    $this = $(this);
    data = $this.data('axa.ie9Spinner');
    if (!data) {
      data = new IE9Spinner(this, options);
      return $this.data('axa.ie9Spinner', data);
    }
  });
};

$.fn.ie9Spinner = Plugin;

$.fn.ie9Spinner.Constructor = IE9Spinner;

$(window).on('load', function() {
  var elm, i, len, properties, property;
  elm = document.createElement('div');
  properties = ['animation', 'WebkitAnimation', 'MozAnimation', 'msAnimation', 'OAnimation'];
  for (i = 0, len = properties.length; i < len; i++) {
    property = properties[i];
    if (elm.style[property] != null) {
      return;
    }
  }
  return $('[data-spinner]').each(function() {
    var $spinner;
    $spinner = $(this);
    return Plugin.call($spinner);
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
require('svg4everybody');

require('./affix');
require('./autocomplete');
require('./autogrow');
require('./checkbox');
require('./datepicker');
require('./dropdown');
require('./dropzone');
require('./ie9-spinner');
require('./info');
require('./menu-collapsing');
require('./menu-main');
require('./menu-sliding');
require('./modal');
require('./notification');
require('./popover');
require('./segmented-control');
require('./site');

exports.default = {};

},{"./affix":1,"./autocomplete":2,"./autogrow":3,"./checkbox":4,"./datepicker":5,"./dropdown":6,"./dropzone":7,"./ie9-spinner":8,"./info":10,"./menu-collapsing":11,"./menu-main":12,"./menu-sliding":13,"./modal":14,"./notification":15,"./popover":16,"./segmented-control":17,"./site":18,"svg4everybody":19}],10:[function(require,module,exports){
(function (global){
var $, Info, Plugin;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Info = (function() {
  function Info(element, options) {
    var selector;
    this.$element = $(element);
    selector = this.$element.data('target');
    if (selector == null) {
      selector = options.target;
    }
    this.$target = $(selector);
    this.$element.on('click', this, function(event) {
      return event.data.toggle(event);
    });
  }

  Info.prototype.toggle = function() {
    this.$target.slideToggle();
    return this.$element.toggleClass('is-active');
  };

  return Info;

})();

Plugin = function(option) {
  var params;
  params = arguments;
  return this.each(function() {
    var $this, action, data, options;
    options = $.extend({}, data, typeof option === 'object' && option);
    if (typeof option === 'string') {
      action = option;
    }
    $this = $(this);
    data = $this.data('axa.info');
    if (!data) {
      data = new Info(this, options);
      return $this.data('axa.info', data);
    }
  });
};

$.fn.info = Plugin;

$.fn.info.Constructor = Info;

$(window).on('load', function() {
  return $('[data-info]').each(function() {
    var $info;
    $info = $(this);
    return Plugin.call($info);
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],11:[function(require,module,exports){
(function (global){
var $, CollapsingMenu, Plugin;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

CollapsingMenu = (function() {
  CollapsingMenu.DEFAULTS = {
    exclusive: false
  };

  function CollapsingMenu(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, CollapsingMenu.DEFAULTS, options);
    this.init();
  }

  CollapsingMenu.prototype.init = function() {
    return this.$element.on('click', '[data-link]', this, function(event) {
      var link, subLevel;
      link = $(event.target);
      subLevel = link.siblings('[data-level]');
      if (subLevel.length > 0) {
        event.preventDefault();
        return event.data.toggle(subLevel);
      }
    });
  };

  CollapsingMenu.prototype.toggle = function(toSet) {
    var level, parentLevels, parentLinks, shouldOpen;
    level = this.$element.find(toSet);
    if (!level) {
      throw new Error('Provided level not in menu!');
    }
    parentLinks = level.parentsUntil(this.$element, '[data-link]');
    parentLevels = level.parentsUntil(this.$element, '[data-level]');
    shouldOpen = !level.hasClass('is-open');
    if (shouldOpen && this.options.exclusive) {
      this.$element.find('[data-level]').not(parentLevels).removeClass('is-open').siblings('[data-link]').removeClass('is-active');
    }
    return level.toggleClass('is-open', shouldOpen).siblings('[data-link]').toggleClass('is-active', shouldOpen);
  };

  return CollapsingMenu;

})();

Plugin = function(option) {
  var params;
  params = arguments;
  return this.each(function() {
    var $this, action, data, options;
    $this = $(this);
    options = $.extend({}, CollapsingMenu.DEFAULTS, data, typeof option === 'object' && option);
    if (typeof option === 'string') {
      action = option;
    }
    data = $this.data('axa.menu');
    if (!data) {
      data = new CollapsingMenu(this, options);
      $this.data('axa.menu', data);
    }
    if (action === 'toggle') {
      return data.toggle(params[1]);
    }
  });
};

$.fn.collapsingMenu = Plugin;

$.fn.collapsingMenu.Constructor = CollapsingMenu;

$(window).on('load', function() {
  return $('[data-menu="collapsing"]').each(function() {
    var $menu, data;
    $menu = $(this);
    data = $menu.data();
    return Plugin.call($menu, data);
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],12:[function(require,module,exports){
(function (global){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var _jquery2 = _interopRequireDefault(_jquery);

var _baconjs = (typeof window !== "undefined" ? window['Bacon'] : typeof global !== "undefined" ? global['Bacon'] : null);

var _baconjs2 = _interopRequireDefault(_baconjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MainMenu = (function () {
  function MainMenu(element) {
    _classCallCheck(this, MainMenu);

    this.$element = (0, _jquery2.default)(element);
    this.$items = this.$element.find('[data-item]');
    this.$links = this.$element.find('[data-link]');
    this.$panels = this.$element.find('[data-panel]');
    this.init();
  }

  _createClass(MainMenu, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var currentlyOpen = this.$items.asEventStream('mouseenter').merge(this.$items.asEventStream('mouseleave')).throttle(100).map(function (e) {
        return {
          type: e.type,
          $e: (0, _jquery2.default)(e.currentTarget)
        };
      }).scan(null, function (open, event) {
        if (event.type == 'mouseenter' || event.type == 'mouseover') return event.$e;
        if (event.type == 'mouseleave') return null;
      });

      currentlyOpen.onValue(function (open) {
        _this.open(open);
      });
    }
  }, {
    key: 'open',
    value: function open($itemOrNull) {
      var $item = (0, _jquery2.default)();

      if ($itemOrNull) {
        $item = this.$items.filter($itemOrNull);
        if (!$item) throw new Error('please provide either a link, a panel or null');
      }

      this.$items.each(function (i, e) {
        var $e = (0, _jquery2.default)(e);
        var toggleClass = $e.is($item);

        $e.find('[data-panel]').toggleClass('is-open', toggleClass);
      });
    }
  }]);

  return MainMenu;
})();

function Plugin() {
  var params = arguments;

  return this.each(function () {
    var $this = (0, _jquery2.default)(this);
    var data = $this.data('aem.menu');

    if (!data) {
      data = new MainMenu(this);
      $this.data('aem.menu', data);
    }
  });
}

_jquery2.default.fn.mainMenu = Plugin;
_jquery2.default.fn.mainMenu.Constructor = MainMenu;

(0, _jquery2.default)(function () {
  (0, _jquery2.default)('[data-menu="main"]').each(function () {
    var $menu = (0, _jquery2.default)(this);
    Plugin.call($menu);
  });
});

// Copyright AXA Versicherungen AG 2015

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],13:[function(require,module,exports){
(function (global){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SlidingMenu = (function () {
  function SlidingMenu(element) {
    var _this = this;

    _classCallCheck(this, SlidingMenu);

    this.$element = (0, _jquery2.default)(element);

    this.init();

    var $currentLevel = this.$element.find('.is-current');
    var $uppermostLevel = this.$element.children('[data-level]');

    this.level($currentLevel.length > 0 ? $currentLevel : $uppermostLevel);

    (0, _jquery2.default)(window).on('resize', function (e) {
      return _this.onWindowResize(e);
    });
  }

  _createClass(SlidingMenu, [{
    key: 'init',
    value: function init() {
      this.$element.on('click', '[data-back]', this, function (event) {
        var link = (0, _jquery2.default)(event.target);
        var currentLevel = link.closest('[data-level]');
        var upperLevel = currentLevel.parent().closest('[data-level]');

        event.preventDefault();
        event.data.level(upperLevel);
      });

      this.$element.on('click', '[data-link]', this, function (event) {
        var link = (0, _jquery2.default)(event.target);
        var subLevel = link.siblings('[data-level]');

        if (subLevel.length > 0) {
          event.preventDefault();
          event.data.level(subLevel);
        }
      });
    }
  }, {
    key: 'onWindowResize',
    value: function onWindowResize(e) {
      this.$element.css('height', this.level().outerHeight());
    }
  }, {
    key: 'level',
    value: function level(toSet) {
      if (!toSet) {
        return this.$element.find('.is-current');
      }

      this.$element.find('.is-current').removeClass('is-current');
      this.$element.find('[data-level]').css('left', '');

      var lvl = this.$element.find(toSet);

      if (!lvl) {
        throw new Error('Provided level not in menu!');
      }

      this.$element.css('height', lvl.outerHeight());

      var parentLevels = lvl.parentsUntil(this.$element, '[data-level]');
      var parentLinks = lvl.parentsUntil(this.$element, '[data-link]');

      var left = -100 * parentLevels.length;
      this.$element.children('[data-level]').css('left', left + '%');

      lvl.addClass('is-current');
    }
  }]);

  return SlidingMenu;
})();

function Plugin() {
  var params = arguments;

  return this.each(function () {
    var $this = (0, _jquery2.default)(this);
    var data = $this.data('axa.menu');

    if (!data) {
      data = new SlidingMenu(this);
      $this.data('axa.menu', data);
    }

    var method = params[0];
    if (typeof method === 'string') {
      var _data;

      var args = Array.prototype.slice.call(params, 1);
      (_data = data)[method].apply(_data, _toConsumableArray(args));
    }
  });
}

_jquery2.default.fn.slidingMenu = Plugin;
_jquery2.default.fn.slidingMenu.Constructor = SlidingMenu;

(0, _jquery2.default)(function () {
  (0, _jquery2.default)('[data-menu="sliding"]').each(function () {
    var $menu = (0, _jquery2.default)(this);
    Plugin.call($menu);
  });
});

// Copyright AXA Versicherungen AG 2015

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],14:[function(require,module,exports){
(function (global){
var $, Modal, Plugin;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Modal = (function() {
  function Modal(element, options) {
    this.$element = $(element);
  }

  Modal.prototype.toggle = function() {
    if (this.$element.hasClass('is-active')) {
      this.$element.removeClass('is-active');
      return $('body').removeClass('is-modal-open');
    } else {
      this.$element.addClass('is-active');
      return $('body').addClass('is-modal-open');
    }
  };

  return Modal;

})();

Plugin = function(option) {
  var params;
  params = arguments;
  return this.each(function() {
    var $this, data;
    $this = $(this);
    data = $this.data('axa.modal');
    if (!data) {
      data = new Modal(this);
      $this.data('axa.modal', data);
    }
    if (typeof option === 'string') {
      return data[option]();
    }
  });
};

$.fn.modal = Plugin;

$.fn.modal.Constructor = Modal;

$(document).on('click.axa.modal.data-api', '[data-modal]', function(e) {
  var $target;
  e.preventDefault();
  $target = $($(e.currentTarget).data('modal'));
  return Plugin.call($target, 'toggle');
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],15:[function(require,module,exports){
(function (global){
var $, NotificationPane, Plugin;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

NotificationPane = (function() {
  function NotificationPane(element, options) {
    this.$element = $(element);
    console.log(this.$element);
    this.path = {
      info: this.$element.data('notification-info'),
      success: this.$element.data('notification-success'),
      error: this.$element.data('notification-error')
    };
  }

  NotificationPane.prototype.displayNotification = function(notification) {
    var $content, $icon, $iconContainer, $notification, timeout;
    if (notification == null) {
      return;
    }
    $notification = $('<div class="notifications__item" ></div>');
    $icon = null;
    if (notification.modifier) {
      console.log(notification.modifier);
      console.log(this.path);
      console.log(this.path[notification.modifier]);
      $notification.addClass('notifications__item--' + notification.modifier);
      $icon = '<svg class="icon notifications__item__icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="' + this.path[notification.modifier] + '"></use></svg>';
      console.log($icon);
    }
    $iconContainer = $('<div class="notifications__item__icon-container">');
    $iconContainer.append($icon);
    $notification.append($iconContainer);
    $notification.on('click', function() {
      return this.hideNotification($notification);
    });
    $content = $('<div class="notifications__item__content"></div>');
    if (notification.html === true) {
      $content.html(notification.content);
    } else {
      $content.text(notification.content);
    }
    $notification.append($content);
    timeout = 2000;
    if (typeof notification.timeout === "number") {
      timeout = notification.timeout;
    }
    setTimeout(((function(_this) {
      return function() {
        return _this.hideNotification($notification);
      };
    })(this)), timeout);
    return this.$element.append($notification);
  };

  NotificationPane.prototype.hideNotification = function($notification) {
    $notification.addClass('notifications__item--fade-out');
    return setTimeout((function() {
      return $notification.remove();
    }), 500);
  };

  return NotificationPane;

})();

Plugin = function(option) {
  var params;
  params = arguments;
  return this.each(function() {
    var $this, data;
    $this = $(this);
    data = $this.data('axa.notification');
    if (!data) {
      data = new NotificationPane(this);
      $this.data('axa.notification', data);
    }
    if (typeof option === 'object') {
      data.displayNotification(option);
    }
    if (typeof option === 'string') {
      return data.displayNotification({
        content: option
      });
    }
  });
};

$.fn.notification = Plugin;

$.fn.notification.Constructor = NotificationPane;

$(document).on('click.axa.notification.data-api', '[data-notification]', function(e) {
  var $target, $this;
  e.preventDefault();
  $this = $(this);
  $target = $($this.data('notification'));
  return Plugin.call($target, {
    content: $this.data('notification-content'),
    modifier: $this.data('notification-modifier')
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],16:[function(require,module,exports){
(function (global){
var $, Plugin, Popover,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Popover = (function() {
  function Popover(element, options) {
    this.position = bind(this.position, this);
    this.element = element;
    this.$element = $(element);
    this.options = $.extend({}, options);
    this.$target = $(this.$element.data('popover'));
    this.$closeIcon = this.$target.find('.popover__close');
    this.isOpen = false;
    this.$element.on('click', this, this.toggle);
    this.$closeIcon.on('click', this, this.toggle);
    this.position();
    $(window).on('resize', this.position);
  }

  Popover.prototype.toggle = function(event) {
    event.data.isOpen = !event.data.isOpen;
    event.data.position();
    return event.data.$target.toggleClass('is-active');
  };

  Popover.prototype.position = function() {
    var $box, $tail, isSmall, maxOffsetLeft, maxOffsetTop, offset, tailClass, tailOffset;
    $box = this.$target.find('.popover__box');
    $tail = this.$target.find('.popover__tail');
    isSmall = false;
    if (window.matchMedia != null) {
      isSmall = !window.matchMedia('(min-width: 768px)').matches;
    } else {
      isSmall = $(window).outerWidth() < 768;
    }
    if (isSmall) {
      if (this.isOpen) {
        $('body').addClass('is-modal-open');
      } else {
        $('body').removeClass('is-modal-open');
      }
      return $box.css({
        top: 0,
        left: 0
      });
    } else {
      $('body').removeClass('is-modal-open');
      maxOffsetTop = $(document).height() - $box.outerHeight();
      maxOffsetLeft = $(document).width() - $box.outerWidth() - 20;
      offset = {
        top: 0,
        left: 0
      };
      offset.top = this.$element.offset().top + this.$element.outerHeight() + 20;
      offset.left = this.$element.offset().left;
      if (offset.left > maxOffsetLeft) {
        offset.left = maxOffsetLeft;
      }
      $tail.removeClass('popover__tail--top popover__tail--bottom');
      tailOffset = {
        top: 0,
        left: 0
      };
      tailOffset.top = this.$element.offset().top + this.$element.outerHeight() - 20;
      tailOffset.left = this.$element.offset().left + this.$element.outerWidth() / 2 - 20;
      tailClass = 'popover__tail--top';
      if (offset.top > maxOffsetTop) {
        offset.top = this.$element.offset().top - $box.outerHeight() - 20;
        tailOffset.top = this.$element.offset().top - 20;
        tailClass = 'popover__tail--bottom';
      }
      $box.offset(offset);
      $tail.addClass(tailClass);
      return $tail.offset(tailOffset);
    }
  };

  return Popover;

})();

Plugin = function(option) {
  var params;
  params = arguments;
  return this.each(function() {
    var $this, data, options;
    options = $.extend({}, data, typeof option === 'object' && option);
    $this = $(this);
    data = $this.data('axa.popover');
    if (!data) {
      data = new Popover(this, options);
      return $this.data('axa.popover', data);
    }
  });
};

$.fn.popover = Plugin;

$.fn.popover.Constructor = Popover;

$(window).on('load', function() {
  return $('[data-popover]').each(function() {
    var $popover;
    $popover = $(this);
    return Plugin.call($popover);
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],17:[function(require,module,exports){
(function (global){
var $, Plugin, SegmentedControl,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

SegmentedControl = (function() {
  SegmentedControl.DEFAULTS;

  function SegmentedControl(element, options) {
    this.setRadioState = bind(this.setRadioState, this);
    this.handleKeyDown = bind(this.handleKeyDown, this);
    this.handleKeyUp = bind(this.handleKeyUp, this);
    var disabled;
    this.$element = $(element);
    disabled = this.$element.is('[disabled=disabled]');
    this.$radios = this.$element.find('.segmented-control__item__radio');
    this.$radios.each(function(index, element) {
      var $radio;
      $radio = $(element);
      if (disabled) {
        $radio.prop('disabled', 'disabled');
      }
      return $radio.data('item.element', $radio.closest('.segmented-control__item'));
    });
    this.options = $.extend({}, SegmentedControl.DEFAULTS, options);
    this.init();
  }

  SegmentedControl.prototype.init = function() {
    this.$radios.prop('tabindex', '-1');
    this.$element.prop('tabindex', '0');
    this.$element.addClass('segmented-control--js');
    this.setRadioState();
    this.$radios.on('change', this.setRadioState);
    this.$element.on('keyup', this.handleKeyUp);
    this.$element.on('keydown', this.handleKeyDown);
    this.stackControlsIfNeeded();
    return $('window').on('resize', this.stackControlsIfNeeded);
  };

  SegmentedControl.prototype.stackControlsIfNeeded = function() {
    this.$element.removeClass('segmented-control--stacked');
    if (this.$element.outerWidth() >= this.$element.parent().innerWidth()) {
      return this.$element.addClass('segmented-control--stacked');
    }
  };

  SegmentedControl.prototype.handleKeyUp = function(e) {
    var $first;
    if (e.which === 32) {
      e.preventDefault();
      if (this.$radios.filter(':checked').length === 0) {
        $first = $(this.$radios[0]);
        $first.prop('checked', true);
        return $first.change();
      }
    }
  };

  SegmentedControl.prototype.handleKeyDown = function(e) {
    var $checked, $first, $next, $previous;
    switch (e.which) {
      case 32:
        return e.preventDefault();
      case 37:
      case 38:
        e.preventDefault();
        $checked = $(this.$radios.filter(':checked'));
        if ($checked.length !== 0) {
          $previous = $(this.$radios[this.$radios.index($checked) - 1]);
          if (($previous != null) && $previous.length !== 0) {
            $previous.prop('checked', true);
            return $previous.change();
          }
        }
        break;
      case 39:
      case 40:
        e.preventDefault();
        $checked = $(this.$radios.filter(':checked'));
        if ($checked.length === 0) {
          $first = $(this.$radios[1]);
          if (($first != null) & $first.length !== 0) {
            $first.prop('checked', true);
            return $first.change();
          }
        } else {
          $next = $(this.$radios[this.$radios.index($checked) + 1]);
          if (($next != null) && $next.length !== 0) {
            $next.prop('checked', true);
            return $next.change();
          }
        }
    }
  };

  SegmentedControl.prototype.setRadioState = function() {
    return this.$radios.each(function(index, element) {
      var $item, $radio;
      $radio = $(element);
      $item = $radio.data('item.element');
      if ($radio.is(':checked')) {
        return $item.addClass('is-active');
      } else {
        return $item.removeClass('is-active');
      }
    });
  };

  return SegmentedControl;

})();

Plugin = function(option) {
  var params;
  params = arguments;
  return this.each(function() {
    var $this, data, options;
    $this = $(this);
    options = $.extend({}, SegmentedControl.DEFAULTS, data, typeof option === 'object' && option);
    data = $this.data('axa.segmentedControl');
    if (!data) {
      data = new SegmentedControl(this, options);
      return $this.data('axa.segmentedControl', data);
    }
  });
};

$.fn.segmentedControl = Plugin;

$.fn.segmentedControl.Constructor = SegmentedControl;

$(window).on('load', function() {
  return $('[data-segmented-control]').each(function() {
    var $segmentedControl, data;
    $segmentedControl = $(this);
    data = $segmentedControl.data();
    return Plugin.call($segmentedControl, data);
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],18:[function(require,module,exports){
(function (global){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Site = (function () {
  function Site(element) {
    _classCallCheck(this, Site);

    this.$element = (0, _jquery2.default)(element);
    this.$page = this.$element.find('[data-page]');
    this.$mask = this.$element.find('[data-mask]');
    this.$mobile = this.$element.find('[data-mobile]');
    this.$burger = this.$element.find('[data-burger]');
    this.init();
  }

  _createClass(Site, [{
    key: 'init',
    value: function init() {
      var _this = this;

      this.$mask.on('click', function (event) {
        event.preventDefault();
        _this.hideMenu();
      });

      this.$burger.on('click', function (event) {
        event.preventDefault();
        _this.toggleMenu();
      });
    }
  }, {
    key: 'toggleMenu',
    value: function toggleMenu(show) {
      if (show === undefined) {
        show = !this.$page.hasClass('is-pushed');
      }

      this.$element.toggleClass('is-mobile-nav-open', show);
      this.$page.toggleClass('is-pushed', show);
      this.$mask.toggleClass('is-visible', show);
      this.$mobile.toggleClass('is-visible', show);
      this.$burger.each(function (i, element) {
        element.classList.toggle('is-open', show);
      });
    }
  }, {
    key: 'showMenu',
    value: function showMenu() {
      this.toggleMenu(true);
    }
  }, {
    key: 'hideMenu',
    value: function hideMenu() {
      this.toggleMenu(false);
    }
  }]);

  return Site;
})();

function Plugin() {
  var params = arguments;

  return this.each(function () {
    var $this = (0, _jquery2.default)(this);
    var data = $this.data('axa.site');

    if (!data) {
      data = new Site(this);
      $this.data('axa.site', data);
    }

    var method = params[0];
    if (typeof method === 'string') {
      var _data;

      (_data = data)[method].apply(_data, _toConsumableArray(params.slice(1)));
    }
  });
}

_jquery2.default.fn.site = Plugin;
_jquery2.default.fn.site.Constructor = Site;

(0, _jquery2.default)(function () {
  (0, _jquery2.default)('[data-site]').each(function () {
    var $site = (0, _jquery2.default)(this);
    Plugin.call($site);
  });
});

// Copyright AXA Versicherungen AG 2015

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],19:[function(require,module,exports){
!function(a,b){"function"==typeof define&&define.amd?define([],function(){return a.svg4everybody=b()}):"object"==typeof exports?module.exports=b():a.svg4everybody=b()}(this,function(){/*! svg4everybody v2.0.0 | github.com/jonathantneal/svg4everybody */
function a(a,b){if(b){var c=!a.getAttribute("viewBox")&&b.getAttribute("viewBox"),d=document.createDocumentFragment(),e=b.cloneNode(!0);for(c&&a.setAttribute("viewBox",c);e.childNodes.length;)d.appendChild(e.firstChild);a.appendChild(d)}}function b(b){b.onreadystatechange=function(){if(4===b.readyState){var c=document.createElement("x");c.innerHTML=b.responseText,b.s.splice(0).map(function(b){a(b[0],c.querySelector("#"+b[1].replace(/(\W)/g,"\\$1")))})}},b.onreadystatechange()}function c(c){function d(){for(var c,l,m=0;m<f.length;)if(c=f[m],l=c.parentNode,l&&/svg/i.test(l.nodeName)){var n=c.getAttribute("xlink:href");if(e){var o=new Image,p=l.getAttribute("width"),q=l.getAttribute("height");o.src=g(n,l,c),p&&o.setAttribute("width",p),q&&o.setAttribute("height",q),l.replaceChild(o,c)}else if(h&&(!i||i(n,l,c))){var r=n.split("#"),s=r[0],t=r[1];if(l.removeChild(c),s.length){var u=k[s]=k[s]||new XMLHttpRequest;u.s||(u.s=[],u.open("GET",s),u.send()),u.s.push([l,t]),b(u)}else a(l,document.getElementById(t))}}else m+=1;j(d,17)}c=c||{};var e,f=document.getElementsByTagName("use"),g=c.fallback||function(a){return a.replace(/\?[^#]+/,"").replace("#",".").replace(/^\./,"")+".png"+(/\?[^#]+/.exec(a)||[""])[0]};e="nosvg"in c?c.nosvg:/\bMSIE [1-8]\b/.test(navigator.userAgent),e&&(document.createElement("svg"),document.createElement("use"));var h="polyfill"in c?c.polyfill:e||/\bEdge\/12\b|\bMSIE [1-8]\b|\bTrident\/[567]\b|\bVersion\/7.0 Safari\b/.test(navigator.userAgent)||(navigator.userAgent.match(/AppleWebKit\/(\d+)/)||[])[1]<537,i=c.validate,j=window.requestAnimationFrame||setTimeout,k={};h&&d()}return c});
},{}]},{},[9])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcXVlcnkvYWZmaXguY29mZmVlIiwianF1ZXJ5L2F1dG9jb21wbGV0ZS5jb2ZmZWUiLCJqcXVlcnkvYXV0b2dyb3cuY29mZmVlIiwianF1ZXJ5L2NoZWNrYm94LmNvZmZlZSIsImpxdWVyeS9kYXRlcGlja2VyLmNvZmZlZSIsImpxdWVyeS9qcXVlcnkvZHJvcGRvd24uanMiLCJqcXVlcnkvZHJvcHpvbmUuY29mZmVlIiwianF1ZXJ5L2llOS1zcGlubmVyLmNvZmZlZSIsImpxdWVyeS9pbmRleC5qcyIsImpxdWVyeS9pbmZvLmNvZmZlZSIsImpxdWVyeS9tZW51LWNvbGxhcHNpbmcuY29mZmVlIiwianF1ZXJ5L2pxdWVyeS9tZW51LW1haW4uanMiLCJqcXVlcnkvanF1ZXJ5L21lbnUtc2xpZGluZy5qcyIsImpxdWVyeS9tb2RhbC5jb2ZmZWUiLCJqcXVlcnkvbm90aWZpY2F0aW9uLmNvZmZlZSIsImpxdWVyeS9wb3BvdmVyLmNvZmZlZSIsImpxdWVyeS9zZWdtZW50ZWQtY29udHJvbC5jb2ZmZWUiLCJqcXVlcnkvanF1ZXJ5L3NpdGUuanMiLCJub2RlX21vZHVsZXMvc3ZnNGV2ZXJ5Ym9keS9kaXN0L3N2ZzRldmVyeWJvZHkubGVnYWN5Lm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxJQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFHRTtFQUNKLEtBQUMsQ0FBQSxPQUFELEdBQVc7O0VBRVgsS0FBQyxDQUFBLEtBQUQsR0FBUzs7RUFFVCxLQUFDLENBQUEsUUFBRCxHQUNFO0lBQUEsTUFBQSxFQUFRLENBQVI7SUFDQSxNQUFBLEVBQVEsTUFEUjs7O0VBR1csZUFBQyxPQUFELEVBQVUsT0FBVjtJQUNYLElBQUMsQ0FBQSxPQUFELEdBQVcsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxFQUFULEVBQWEsS0FBSyxDQUFDLFFBQW5CLEVBQTZCLE9B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Qy9CLGVBQUEsSUFBSSxFQUFDLE1BQU0sT0FBQywyQkFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUE7S0FDakM7R0FDRixDQUFDLENBQUE7Q0FDSDs7QUFFRCxpQkFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQTtBQUNsQixpQkFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUE7O0FBRTVCLHNCQUFFLFlBQVk7QUFDWix3QkFBRSxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWTtBQUNoQyxRQUFJLEtBQUssR0FBRyxzQkFBRSxJQUFJLENBQUMsQ0FBQTtBQUNuQixVQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQ25CLENBQUMsQ0FBQTtDQUNILENBQUM7OztBQUFBOzs7O0FDeEVGO0FBQ0EiLCJmaWxlIjoic3R5bGUtZ3VpZGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiQgPSByZXF1aXJlICdqcXVlcnknXHJcblxyXG4jIFB1YmxpYyBjbGFzcyBkZWZpbml0aW9uXHJcbmNsYXNzIEFmZml4XHJcbiAgQFZFUlNJT04gPSAnMS4wLjAnXHJcblxyXG4gIEBSRVNFVCA9ICdpcy1hZmZpeGVkIGlzLWFmZml4ZWQtdG9wIGlzLWFmZml4ZWQtYm90dG9tJ1xyXG5cclxuICBAREVGQVVMVFM6XHJcbiAgICBvZmZzZXQ6IDAsXHJcbiAgICB0YXJnZXQ6IHdpbmRvd1xyXG5cclxuICBjb25zdHJ1Y3RvcjogKGVsZW1lbnQsIG9wdGlvbnMpIC0+XHJcbiAgICBAb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBBZmZpeC5ERUZBVUxUUywgb3B0aW9ucylcclxuXHJcbiAgICBAJHRhcmdldCA9ICQoQG9wdGlvbnMudGFyZ2V0KVxyXG4gICAgICAub24oJ3Njcm9sbC5heGEuYWZmaXguZGF0YS1hcGknLCAkLnByb3h5KEBjaGVja1Bvc2l0aW9uLCB0aGlzKSlcclxuICAgICAgLm9uKCdjbGljay5heGEuYWZmaXguZGF0YS1hcGknLCAkLnByb3h5KEBjaGVja1Bvc2l0aW9uV2l0aEV2ZW50TG9vcCwgdGhpcykpXHJcblxyXG4gICAgQCRlbGVtZW50ID0gJChlbGVtZW50KVxyXG4gICAgQGFmZml4ZWQgPSBudWxsXHJcbiAgICBAdW5waW4gPSBudWxsXHJcbiAgICBAcGlubmVkT2Zmc2V0ID0gbnVsbFxyXG5cclxuICAgIEBjaGVja1Bvc2l0aW9uKClcclxuXHJcbiAgZ2V0U3RhdGU6IChzY3JvbGxIZWlnaHQsIGhlaWdodCwgb2Zmc2V0VG9wLCBvZmZzZXRCb3R0b20pIC0+XHJcbiAgICBzY3JvbGxUb3AgPSBAJHRhcmdldC5zY3JvbGxUb3AoKVxyXG4gICAgcG9zaXRpb24gPSBAJGVsZW1lbnQub2Zmc2V0KClcclxuICAgIHRhcmdldEhlaWdodCA9IEAkdGFyZ2V0LmhlaWdodCgpXHJcblxyXG4gICAgaWYgb2Zmc2V0VG9wICE9IG51bGwgJiYgQGFmZml4ZWQgPT0gJ3RvcCdcclxuICAgICAgcmV0dXJuIGlmIHNjcm9sbFRvcCA8IG9mZnNldFRvcCB0aGVuICd0b3AnIGVsc2UgZmFsc2VcclxuXHJcbiAgICBpZiBAYWZmaXhlZCA9PSAnYm90dG9tJ1xyXG4gICAgICBpZiBvZmZzZXRUb3AgIT0gbnVsbFxyXG4gICAgICAgIHJldHVybiBpZiBzY3JvbGxUb3AgKyBAdW5waW4gPD0gcG9zaXRpb24udG9wIHRoZW4gZmFsc2UgZWxzZSAnYm90dG9tJ1xyXG5cclxuICAgICAgcmV0dXJuIGlmIHNjcm9sbFRvcCArIHRhcmdldEhlaWdodCA8PSBzY3JvbGxIZWlnaHQgLSBvZmZzZXRCb3R0b20gdGhlbiBmYWxzZSBlbHNlICdib3R0b20nXHJcblxyXG4gICAgaW5pdGlhbGl6aW5nID0gQGFmZml4ZWQgPT0gbnVsbFxyXG4gICAgY29sbGlkZXJUb3AgPSBpZiBpbml0aWFsaXppbmcgdGhlbiBzY3JvbGxUb3AgZWxzZSBwb3NpdGlvbi50b3BcclxuICAgIGNvbGxpZGVySGVpZ2h0ID0gaWYgaW5pdGlhbGl6aW5nIHRoZW4gdGFyZ2V0SGVpZ2h0IGVsc2UgaGVpZ2h0XHJcblxyXG4gICAgaWYgb2Zmc2V0VG9wICE9IG51bGwgJiYgY29sbGlkZXJUb3AgPD0gb2Zmc2V0VG9wXHJcbiAgICAgIHJldHVybiAndG9wJ1xyXG5cclxuICAgIGlmIG9mZnNldEJvdHRvbSAhPSBudWxsICYmIChjb2xsaWRlclRvcCArIGNvbGxpZGVySGVpZ2h0ID49IHNjcm9sbEhlaWdodCAtIG9mZnNldEJvdHRvbSlcclxuICAgICAgcmV0dXJuICdib3R0b20nXHJcblxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGdldFBpbm5lZE9mZnNldDogKCkgLT5cclxuICAgIGlmIEBwaW5uZWRPZmZzZXRcclxuICAgICAgcmV0dXJuIEBwaW5uZWRPZmZzZXRcclxuXHJcbiAgICBAJGVsZW1lbnQucmVtb3ZlQ2xhc3MoQWZmaXguUkVTRVQpLmFkZENsYXNzKCdpcy1hZmZpeGVkJylcclxuXHJcbiAgICBzY3JvbGxUb3AgPSBAJHRhcmdldC5zY3JvbGxUb3AoKVxyXG4gICAgcG9zaXRpb24gPSBAJGVsZW1lbnQub2Zmc2V0KClcclxuXHJcbiAgICByZXR1cm4gKEBwaW5uZWRPZmZzZXQgPSBwb3NpdGlvbi50b3AgLSBzY3JvbGxUb3ApXHJcblxyXG4gIGNoZWNrUG9zaXRpb25XaXRoRXZlbnRMb29wOiAoKSAtPlxyXG4gICAgc2V0VGltZW91dCgkLnByb3h5KEBjaGVja1Bvc2l0aW9uLCB0aGlzKSwgMSlcclxuXHJcbiAgY2hlY2tQb3NpdGlvbjogKCkgLT5cclxuICAgIGlmICFAJGVsZW1lbnQuaXMoJzp2aXNpYmxlJylcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgaGVpZ2h0ID0gQCRlbGVtZW50LmhlaWdodCgpXHJcbiAgICBvZmZzZXQgPSBAb3B0aW9ucy5vZmZzZXRcclxuICAgIG9mZnNldFRvcCA9IG9mZnNldC50b3BcclxuICAgIG9mZnNldEJvdHRvbSA9IG9mZnNldC5ib3R0b21cclxuICAgIHNjcm9sbEhlaWdodCA9ICQoJ2JvZHknKS5oZWlnaHQoKVxyXG5cclxuICAgIG9mZnNldEJvdHRvbSA9IG9mZnNldFRvcCA9IG9mZnNldCBpZiB0eXBlb2Ygb2Zmc2V0ICE9ICdvYmplY3QnXHJcbiAgICBvZmZzZXRUb3AgPSBvZmZzZXQudG9wKEAkZWxlbWVudCkgaWYgdHlwZW9mIG9mZnNldFRvcCA9PSAnZnVuY3Rpb24nXHJcbiAgICBvZmZzZXRCb3R0b20gPSBvZmZzZXQuYm90dG9tKEAkZWxlbWVudCkgaWYgdHlwZW9mIG9mZnNldEJvdHRvbSA9PSAnZnVuY3Rpb24nXHJcblxyXG4gICAgYWZmaXggPSBAZ2V0U3RhdGUoc2Nyb2xsSGVpZ2h0LCBoZWlnaHQsIG9mZnNldFRvcCwgb2Zmc2V0Qm90dG9tKVxyXG5cclxuICAgIGlmIEBhZmZpeGVkICE9IGFmZml4XHJcbiAgICAgIEAkZWxlbWVudC5jc3MoJ3RvcCcsICcnKSBpZiBAdW5waW4gIT0gbnVsbFxyXG5cclxuICAgICAgYWZmaXhUeXBlID0gJ2lzLWFmZml4ZWQnICsgaWYgYWZmaXggdGhlbiAnLScgKyBhZmZpeCBlbHNlICcnXHJcbiAgICAgIGUgPSAkLkV2ZW50KGFmZml4VHlwZSArICcuYXhhLmFmZml4JylcclxuXHJcbiAgICAgIEAkZWxlbWVudC50cmlnZ2VyKGUpXHJcblxyXG4gICAgICBpZiBlLmlzRGVmYXVsdFByZXZlbnRlZCgpXHJcbiAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICBAYWZmaXhlZCA9IGFmZml4XHJcblxyXG4gICAgICBpZiBhZmZpeCA9PSAnYm90dG9tJ1xyXG4gICAgICAgIEB1bnBpbiA9IEBnZXRQaW5uZWRPZmZzZXQoKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgQHVucGluID0gbnVsbFxyXG5cclxuICAgICAgQCRlbGVtZW50XHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKEFmZml4LlJFU0VUKVxyXG4gICAgICAgIC5hZGRDbGFzcyhhZmZpeFR5cGUpXHJcbiAgICAgICAgLnRyaWdnZXIoYWZmaXhUeXBlLnJlcGxhY2UoJ2FmZml4JywgJ2FmZml4ZWQnKSArICcuYXhhLmFmZml4JylcclxuXHJcbiAgICBpZiBhZmZpeCA9PSAnYm90dG9tJ1xyXG4gICAgICBAJGVsZW1lbnQub2Zmc2V0XHJcbiAgICAgICAgdG9wOiBzY3JvbGxIZWlnaHQgLSBoZWlnaHQgLSBvZmZzZXRCb3R0b21cclxuXHJcbiMgUGx1Z2luIGRlZmluaXRpb25cclxuUGx1Z2luID0gKG9wdGlvbikgLT5cclxuICBAZWFjaCAoKSAtPlxyXG4gICAgJHRoaXMgPSAkKHRoaXMpXHJcbiAgICBkYXRhID0gJHRoaXMuZGF0YSgnYXhhLmFmZml4JylcclxuICAgIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxyXG5cclxuICAgICR0aGlzLmRhdGEoJ2F4YS5hZmZpeCcsIChkYXRhID0gbmV3IEFmZml4KHRoaXMsIG9wdGlvbnMpKSkgaWYgIWRhdGFcclxuICAgIGRhdGFbb3B0aW9uXSgpIGlmIHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZydcclxuXHJcbiMgUGx1Z2luIHJlZ2lzdHJhdGlvblxyXG4kLmZuLmFmZml4ID0gUGx1Z2luXHJcbiQuZm4uYWZmaXguQ29uc3RydWN0b3IgPSBBZmZpeFxyXG5cclxuIyBEQVRBLUFQSVxyXG4kKHdpbmRvdykub24gJ2xvYWQnLCAoKSAtPlxyXG4gICQoJ1tkYXRhLXNweT1cImFmZml4XCJdJykuZWFjaCAoKSAtPlxyXG4gICAgJHNweSA9ICQodGhpcylcclxuICAgIGRhdGEgPSAkc3B5LmRhdGEoKVxyXG5cclxuICAgIGRhdGEub2Zmc2V0ID0gZGF0YS5vZmZzZXQgfHwge31cclxuICAgIGRhdGEub2Zmc2V0LmJvdHRvbSA9IGRhdGEub2Zmc2V0Qm90dG9tIGlmIGRhdGEub2Zmc2V0Qm90dG9tICE9IG51bGxcclxuICAgIGRhdGEub2Zmc2V0LnRvcCA9IGRhdGEub2Zmc2V0VG9wIGlmIGRhdGEub2Zmc2V0VG9wICE9IG51bGxcclxuXHJcbiAgICBQbHVnaW4uY2FsbCgkc3B5LCBkYXRhKVxyXG5cclxuIyEgQ29weXJpZ2h0IEFYQSBWZXJzaWNoZXJ1bmdlbiBBRyAyMDE1XHJcbiIsIiQgPSByZXF1aXJlICdqcXVlcnknXHJcblxyXG4jIFB1YmxpYyBjbGFzcyBkZWZpbml0aW9uXHJcbmNsYXNzIEF1dG9jb21wbGV0ZVxyXG5cclxuICBjb25zdHJ1Y3RvcjogKGVsZW1lbnQsIG9wdGlvbnMpIC0+XHJcbiAgICBAZWxlbWVudCA9IGVsZW1lbnRcclxuICAgIEAkZWxlbWVudCA9ICQgZWxlbWVudFxyXG4gICAgQG9wdGlvbnMgPSAkLmV4dGVuZCB7fSwgb3B0aW9uc1xyXG4gICAgQGZpbHRlcmVkID0gQG9wdGlvbnMuc291cmNlXHJcbiAgICBAZmlsdGVyZWQgPSBbXSBpZiBub3QgQGZpbHRlcmVkP1xyXG4gICAgQHZhbHVlID0gJydcclxuICAgIEBpc01vdXNlT3ZlciA9IGZhbHNlXHJcblxyXG4gICAgQCRkcm9wZG93biA9ICQgJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGVfX3N1Z2dlc3Rpb25zXCI+PC9kaXY+J1xyXG4gICAgQCRkcm9wZG93bi5oaWRlKClcclxuICAgIEAkZWxlbWVudC5hZnRlciBAJGRyb3Bkb3duXHJcblxyXG4gICAgQCRlbGVtZW50Lm9uICdrZXl1cCcsIEAsIChldmVudCkgLT5cclxuICAgICAgZXZlbnQuZGF0YS5maWx0ZXIoZXZlbnQpXHJcblxyXG4gICAgQCRlbGVtZW50Lm9uICdibHVyJywgQCwgKGV2ZW50KSAtPlxyXG4gICAgICBpZiBub3QgZXZlbnQuZGF0YS5pc01vdXNlT3ZlclxyXG4gICAgICAgIGV2ZW50LmRhdGEuJGRyb3Bkb3duLmhpZGUoKVxyXG5cclxuICBmaWx0ZXI6IChldmVudCkgLT5cclxuICAgIGlmIEB2YWx1ZSBpc250IEBlbGVtZW50LnZhbHVlXHJcbiAgICAgIEB2YWx1ZSA9IEBlbGVtZW50LnZhbHVlXHJcbiAgICAgIEBmaWx0ZXJlZCA9ICh0ZXh0IGZvciB0ZXh0IGluIEBvcHRpb25zLnNvdXJjZSB3aGVuIHRleHQuaW5kZXhPZihAdmFsdWUpID4gLTEpXHJcbiAgICAgIEAkZHJvcGRvd24uZW1wdHkoKVxyXG4gICAgICBmb3IgdGV4dCBpbiBAZmlsdGVyZWRcclxuICAgICAgICBAJGRyb3Bkb3duLmFwcGVuZCBAY3JlYXRlSXRlbSh0ZXh0KVxyXG4gICAgICBAJGRyb3Bkb3duLnNob3coKVxyXG5cclxuICBjcmVhdGVJdGVtOiAodGV4dCkgLT5cclxuICAgIGl0ZW0gPSAkICc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlX19zdWdnZXN0aW9uc19faXRlbVwiPicgKyB0ZXh0ICsgJzwvZGl2PidcclxuICAgIGl0ZW0ub24gJ21vdXNlb3ZlcicsIEAsIChldmVudCkgLT5cclxuICAgICAgZXZlbnQuZGF0YS5pc01vdXNlT3ZlciA9IHRydWVcclxuICAgICAgJChldmVudC50YXJnZXQpLmFkZENsYXNzICdhdXRvY29tcGxldGVfX3N1Z2dlc3Rpb25zX19pdGVtLS1zZWxlY3RlZCdcclxuICAgIGl0ZW0ub24gJ21vdXNlb3V0JywgQCwgKGV2ZW50KSAtPlxyXG4gICAgICBldmVudC5kYXRhLmlzTW91c2VPdmVyID0gZmFsc2VcclxuICAgICAgJChldmVudC50YXJnZXQpLnJlbW92ZUNsYXNzICdhdXRvY29tcGxldGVfX3N1Z2dlc3Rpb25zX19pdGVtLS1zZWxlY3RlZCdcclxuICAgIGl0ZW0ub24gJ2NsaWNrJywgQCwgKGV2ZW50KSAtPlxyXG4gICAgICBldmVudC5kYXRhLnNlbGVjdEl0ZW0oZXZlbnQpXHJcblxyXG4gICAgcmV0dXJuIGl0ZW07XHJcblxyXG4gIHNlbGVjdEl0ZW06IChldmVudCkgLT5cclxuICAgIEBlbGVtZW50LnZhbHVlID0gZXZlbnQudGFyZ2V0LnRleHRDb250ZW50XHJcbiAgICBAJGRyb3Bkb3duLmhpZGUoKVxyXG5cclxuXHJcbiMgUGx1Z2luIGRlZmluaXRpb25cclxuUGx1Z2luID0gKG9wdGlvbikgLT5cclxuICBwYXJhbXMgPSBhcmd1bWVudHNcclxuXHJcbiAgcmV0dXJuIHRoaXMuZWFjaCAoKSAtPlxyXG4gICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBkYXRhLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcclxuICAgICR0aGlzID0gJCB0aGlzXHJcbiAgICBkYXRhID0gJHRoaXMuZGF0YSgnYXhhLmF1dG9jb21wbGV0ZScpXHJcblxyXG4gICAgaWYgbm90IGRhdGFcclxuICAgICAgZGF0YSA9IG5ldyBBdXRvY29tcGxldGUgdGhpcywgb3B0aW9uc1xyXG4gICAgICAkdGhpcy5kYXRhICdheGEuYXV0b2NvbXBsZXRlJywgZGF0YVxyXG5cclxuIyBQbHVnaW4gcmVnaXN0cmF0aW9uXHJcbiQuZm4uYXV0b2NvbXBsZXRlID0gUGx1Z2luXHJcbiQuZm4uYXV0b2NvbXBsZXRlLkNvbnN0cnVjdG9yID0gQXV0b2NvbXBsZXRlXHJcblxyXG4jIERBVEEtQVBJXHJcbiQod2luZG93KS5vbiAnbG9hZCcsICgpIC0+XHJcbiAgJCgnW2RhdGEtYXV0b2NvbXBsZXRlXScpLmVhY2ggKCkgLT5cclxuICAgICRhdXRvY29tcGxldGUgPSAkKHRoaXMpXHJcbiAgICBQbHVnaW4uY2FsbCgkYXV0b2NvbXBsZXRlKVxyXG5cclxuIyEgQ29weXJpZ2h0IEFYQSBWZXJzaWNoZXJ1bmdlbiBBRyAyMDE1XHJcbiIsIiQgPSByZXF1aXJlICdqcXVlcnknXHJcblxyXG4jIFB1YmxpYyBjbGFzcyBkZWZpbml0aW9uXHJcbmNsYXNzIEF1dG9ncm93XHJcblxyXG4gIGNvbnN0cnVjdG9yOiAoZWxlbWVudCwgb3B0aW9ucykgLT5cclxuICAgIEBlbGVtZW50ID0gZWxlbWVudFxyXG4gICAgQCRlbGVtZW50ID0gJCBlbGVtZW50XHJcbiAgICBAb3B0aW9ucyA9ICQuZXh0ZW5kIHt9LCBvcHRpb25zXHJcblxyXG4gICAgQGluaXQoKVxyXG5cclxuICBpbml0OiAoKSAtPlxyXG4gICAgQG1pbkhlaWdodCA9IEAkZWxlbWVudC5oZWlnaHQoKVxyXG5cclxuICAgIEBzaGFkb3cgPSAkICc8ZGl2PjwvZGl2PidcclxuICAgIEBzaGFkb3cuY3NzIHtcclxuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgIHRvcDogLTEwMDAwLFxyXG4gICAgICBsZWZ0OiAtMTAwMDAsXHJcbiAgICAgIHdpZHRoOiBAJGVsZW1lbnQud2lkdGgoKSxcclxuICAgICAgJ2ZvbnQtc2l6ZSc6IEAkZWxlbWVudC5jc3MoJ2ZvbnQtc2l6ZScpLFxyXG4gICAgICAnZm9udC1mYW1pbHknOiBAJGVsZW1lbnQuY3NzKCdmb250LWZhbWlseScpLFxyXG4gICAgICAnZm9udC13ZWlnaHQnOiBAJGVsZW1lbnQuY3NzKCdmb250LXdlaWdodCcpLFxyXG4gICAgICAnbGluZS1oZWlnaHQnOiBAJGVsZW1lbnQuY3NzKCdsaW5lLWhlaWdodCcpLFxyXG4gICAgICByZXNpemU6ICdub25lJyxcclxuICAgICAgJ3dvcmQtd3JhcCc6ICdicmVhay13b3JkJ1xyXG4gICAgfVxyXG5cclxuICAgIEBzaGFkb3cuYXBwZW5kVG8gZG9jdW1lbnQuYm9keVxyXG5cclxuICAgIEAkZWxlbWVudC5vbiAnY2hhbmdlIGtleXVwIGtleWRvd24nLCBALCAoZXZlbnQpIC0+XHJcbiAgICAgIGV2ZW50LmRhdGEudXBkYXRlKGV2ZW50KVxyXG5cclxuICAgICQod2luZG93KS5yZXNpemUgQHVwZGF0ZVxyXG4gIHVwZGF0ZTogKGV2ZW50KSAtPlxyXG4gICAgdGltZXM6IChzdHJpbmcsIG51bWJlcikgLT5cclxuICAgICAgciA9ICcnXHJcbiAgICAgIHdoaWxlIG51bSAtPSAxXHJcbiAgICAgICAgciArPSBzdHJpbmdcclxuICAgICAgcmV0dXJuIHJcclxuXHJcbiAgICBpZiBAZWxlbWVudFxyXG4gICAgICB2YWwgPSBAZWxlbWVudC52YWx1ZS5yZXBsYWNlKC88L2csICcmbHQ7JylcclxuICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXHJcbiAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcclxuICAgICAgICAucmVwbGFjZSgvXFxuJC8sICc8YnIvPiZuYnNwOycpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHN7Mix9L2csKHNwYWNlKSAtPlxyXG4gICAgICAgICAgcmV0dXJuIHRpbWVzKCcmbmJzcDsnLCBzcGFjZS5sZW5ndGggLSAxKSArICcgJ1xyXG4gICAgICAgIClcclxuXHJcbiAgICAgIGlmIGV2ZW50PyBhbmQgZXZlbnQuZGF0YT8gYW5kIGV2ZW50LmRhdGEuZXZlbnQgaXMgJ2tleWRvd24nIGFuZCBldmVudC5rZXlDb2RlIGlzIDEzXHJcbiAgICAgICAgdmFsICs9ICc8YnIgLz4nXHJcblxyXG4gICAgICBAc2hhZG93LmNzcyAnd2lkdGgnLCBAJGVsZW1lbnQud2lkdGgoKVxyXG4gICAgICBAc2hhZG93Lmh0bWwgdmFsXHJcblxyXG4gICAgICBuZXdIZWlnaHQgPSBNYXRoLm1heCBAc2hhZG93LmhlaWdodCgpLCBAbWluSGVpZ2h0XHJcblxyXG4gICAgICBAJGVsZW1lbnQuaGVpZ2h0IG5ld0hlaWdodFxyXG5cclxuIyBQbHVnaW4gZGVmaW5pdGlvblxyXG5QbHVnaW4gPSAob3B0aW9uKSAtPlxyXG4gIHBhcmFtcyA9IGFyZ3VtZW50c1xyXG5cclxuICByZXR1cm4gdGhpcy5lYWNoICgpIC0+XHJcbiAgICAkdGhpcyA9ICQgdGhpc1xyXG4gICAgZGF0YSA9ICR0aGlzLmRhdGEoJ2F4YS5hdXRvZ3JvdycpXHJcblxyXG4gICAgaWYgbm90IGRhdGFcclxuICAgICAgZGF0YSA9IG5ldyBBdXRvZ3JvdyB0aGlzXHJcbiAgICAgICR0aGlzLmRhdGEgJ2F4YS5hdXRvZ3JvdycsIGRhdGFcclxuXHJcbiMgUGx1Z2luIHJlZ2lzdHJhdGlvblxyXG4kLmZuLmF1dG9ncm93ID0gUGx1Z2luXHJcbiQuZm4uYXV0b2dyb3cuQ29uc3RydWN0b3IgPSBBdXRvZ3Jvd1xyXG5cclxuIyBEQVRBLUFQSVxyXG4kKHdpbmRvdykub24gJ2xvYWQnLCAoKSAtPlxyXG4gICQoJ1tkYXRhLWF1dG9ncm93PVwiYXV0b2dyb3dcIl0nKS5lYWNoICgpIC0+XHJcbiAgICAkYXV0b2dyb3cgPSAkKHRoaXMpXHJcbiAgICBQbHVnaW4uY2FsbCgkYXV0b2dyb3cpXHJcblxyXG4jISBDb3B5cmlnaHQgQVhBIFZlcnNpY2hlcnVuZ2VuIEFHIDIwMTVcclxuIiwiJCA9IHJlcXVpcmUgJ2pxdWVyeSdcclxuXHJcbiMgUHVibGljIGNsYXNzIGRlZmluaXRpb25cclxuY2xhc3MgQ2hlY2tib3hcclxuICBAREVGQVVMVFNcclxuXHJcbiAgY29uc3RydWN0b3I6IChlbGVtZW50LCBvcHRpb25zKSAtPlxyXG4gICAgQCRlbGVtZW50ID0gJCBlbGVtZW50XHJcblxyXG4gICAgIyBUT0RPOiBEbyBub3QgZGVwZW5kIG9uIGNzcyBjbGFzc2VzXHJcbiAgICBAJGNoZWNrYm94ID0gQCRlbGVtZW50LmZpbmQgJy5jaGVja2JveF9fY2hlY2tib3gnXHJcbiAgICBAJGxhYmVsID0gQCRlbGVtZW50LmZpbmQgJy5jaGVja2JveF9fbGFiZWwnXHJcblxyXG4gICAgQG9wdGlvbnMgPSAkLmV4dGVuZCB7fSwgQ2hlY2tib3guREVGQVVMVFMsIG9wdGlvbnNcclxuXHJcbiAgICBAaW5pdCgpXHJcblxyXG4gIGluaXQ6ICgpIC0+XHJcbiAgICBAJGNoZWNrYm94LmF0dHIgJ3RhYmluZGV4JywgJy0xJ1xyXG4gICAgQCRsYWJlbC5hdHRyICd0YWJpbmRleCcsICcwJ1xyXG5cclxuICAgIEAkZWxlbWVudC5hZGRDbGFzcyAnY2hlY2tib3gtLWpzJ1xyXG5cclxuICAgIEBzZXRDaGVja2JveFN0YXRlKClcclxuXHJcbiAgICBAJGNoZWNrYm94Lm9uICdjaGFuZ2UnLCBAc2V0Q2hlY2tib3hTdGF0ZVxyXG5cclxuICAgIEAkbGFiZWwub24gJ2tleXVwJywgQGhhbmRsZUtleVVwXHJcblxyXG4gICMgSGFuZGxlIHNwYWNlYmFyIHRvIHRvZ2dsZSB0aGUgY2hlY2tib3hcclxuICBoYW5kbGVLZXlVcDogKGUpID0+XHJcbiAgICBpZiBlLndoaWNoID09IDMyXHJcbiAgICAgICMgcHJldmVudCBzY3JvbGxpbmdcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgICBAJGNoZWNrYm94LnByb3AgJ2NoZWNrZWQnLCAhKEAkY2hlY2tib3guaXMgJzpjaGVja2VkJylcclxuXHJcbiAgICAgICMgRW1pdCBhIGNoYW5nZSBldmVudCBtYW51YWxseVxyXG4gICAgICBAJGNoZWNrYm94LmNoYW5nZSgpXHJcblxyXG4gICMgVXBkYXRlcyB0aGUgVUkgYWNjb3JkaW5nIHRvIHRoZSBjaGVja2JveCBzdGF0ZVxyXG4gIHNldENoZWNrYm94U3RhdGU6ICgpID0+XHJcbiAgICBpZiBAJGNoZWNrYm94LmlzICc6Y2hlY2tlZCdcclxuICAgICAgQCRlbGVtZW50LmFkZENsYXNzICdpcy1hY3RpdmUnXHJcbiAgICBlbHNlXHJcbiAgICAgIEAkZWxlbWVudC5yZW1vdmVDbGFzcyAnaXMtYWN0aXZlJ1xyXG5cclxuIyBQbHVnaW4gZGVmaW5pdGlvblxyXG5QbHVnaW4gPSAob3B0aW9uKSAtPlxyXG4gIHBhcmFtcyA9IGFyZ3VtZW50c1xyXG5cclxuICByZXR1cm4gdGhpcy5lYWNoICgpIC0+XHJcbiAgICAkdGhpcyA9ICQgdGhpc1xyXG4gICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBDaGVja2JveC5ERUZBVUxUUywgZGF0YSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXHJcbiAgICBkYXRhID0gJHRoaXMuZGF0YSgnYXhhLmNoZWNrYm94JylcclxuXHJcbiAgICBpZiBub3QgZGF0YVxyXG4gICAgICBkYXRhID0gbmV3IENoZWNrYm94IHRoaXMsIG9wdGlvbnNcclxuICAgICAgJHRoaXMuZGF0YSAnYXhhLmNoZWNrYm94JywgZGF0YVxyXG5cclxuIyBQbHVnaW4gcmVnaXN0cmF0aW9uXHJcbiQuZm4uY2hlY2tib3ggPSBQbHVnaW5cclxuJC5mbi5jaGVja2JveC5Db25zdHJ1Y3RvciA9IENoZWNrYm94XHJcblxyXG4jIERBVEEtQVBJXHJcbiQod2luZG93KS5vbiAnbG9hZCcsICgpIC0+XHJcbiAgJCgnW2RhdGEtY2hlY2tib3hdJykuZWFjaCAoKSAtPlxyXG4gICAgJGNoZWNrYm94ID0gJCh0aGlzKVxyXG4gICAgZGF0YSA9ICRjaGVja2JveC5kYXRhKClcclxuXHJcbiAgICBQbHVnaW4uY2FsbCgkY2hlY2tib3gsIGRhdGEpXHJcblxyXG4jISBDb3B5cmlnaHQgQVhBIFZlcnNpY2hlcnVuZ2VuIEFHIDIwMTVcclxuIiwiJCA9IHJlcXVpcmUgJ2pxdWVyeSdcclxubW9tZW50ID0gcmVxdWlyZSAnbW9tZW50J1xyXG5cclxuY2xhc3MgRW1pdHRlclxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGV2ZW50cyA9IHNlbGVjdDogW11cclxuICBvbjogKGV2ZW50TmFtZSwgY2IpID0+XHJcbiAgICBAZXZlbnRzW2V2ZW50TmFtZV0ucHVzaChjYilcclxuICBlbWl0OiAoZXZlbnROYW1lKSA9PlxyXG4gICAgZm9yIGZ4IGluIEBldmVudHNbZXZlbnROYW1lXVxyXG4gICAgICBmeC5hcHBseShudWxsLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKVxyXG5cclxuYXBwZW5kID0gKGh0bWwsICRwYXJlbnQpIC0+XHJcbiAgJGVsID0gJCBodG1sXHJcbiAgJHBhcmVudC5hcHBlbmQgJGVsXHJcbiAgcmV0dXJuICRlbFxyXG5cclxuY2xhc3MgUGlja2VyIGV4dGVuZHMgRW1pdHRlclxyXG5cclxuICBjb25zdHJ1Y3RvcjogKEBtb21lbnQsIEBkaXNwbGF5V2VlaywgQGljb25zKSAtPlxyXG4gICAgc3VwZXJcclxuXHJcbiAgICBAZGF0ZSA9IEBtb21lbnQoKVxyXG5cclxuICAgIEAkZWxlbWVudCA9ICQgJzxkaXYgY2xhc3M9XCJwaWNrZXJcIiA+PC9kaXY+J1xyXG5cclxuICAgIGlmIEBkaXNwbGF5V2Vla1xyXG4gICAgICBAJGVsZW1lbnQuYWRkQ2xhc3MgJ3BpY2tlci0td2l0aC13ZWVrbnVtYmVyJ1xyXG5cclxuICAgIEAkaGVhZGVyID0gYXBwZW5kICc8ZGl2IGNsYXNzPVwicGlja2VyX19oZWFkZXJcIiA+PC9kaXY+JywgQCRlbGVtZW50XHJcblxyXG4gICAgQCRwcmV2ID0gYXBwZW5kICc8ZGl2IGNsYXNzPVwicGlja2VyX19wcmV2XCI+PC9kaXY+JywgQCRoZWFkZXJcclxuICAgIEAkcHJldi5hcHBlbmQgQGNyZWF0ZUljb24oJ3ByZXYnKVxyXG4gICAgQCRwcmV2Lm9uICdjbGljaycsIEBvblByZXZDbGljay5iaW5kKHRoaXMpXHJcblxyXG4gICAgQCRuZXh0ID0gYXBwZW5kICc8ZGl2IGNsYXNzPVwicGlja2VyX19uZXh0XCI+PC9kaXY+JywgQCRoZWFkZXJcclxuICAgIEAkbmV4dC5hcHBlbmQgQGNyZWF0ZUljb24oJ25leHQnKVxyXG4gICAgQCRuZXh0Lm9uICdjbGljaycsIEBvbk5leHRDbGljay5iaW5kKHRoaXMpXHJcblxyXG4gICAgQCRoZWFkbGluZSA9IGFwcGVuZCAnPGRpdiBjbGFzcz1cInBpY2tlcl9faGVhZGxpbmVcIiA+PC9kaXY+JywgQCRoZWFkZXJcclxuICAgIEAkaGVhZGxpbmVfX21vbnRoID0gYXBwZW5kICc8c3BhbiBjbGFzcz1cInBpY2tlcl9faGVhZGxpbmVfX21vbnRoXCIgPjwvc3Bhbj4nLCBAJGhlYWRsaW5lXHJcbiAgICBhcHBlbmQgJzxzcGFuPiA8L3NwYW4+JywgQCRoZWFkbGluZVxyXG4gICAgQCRoZWFkbGluZV9feWVhciA9IGFwcGVuZCAnPHNwYW4+PC9zcGFuPicsIEAkaGVhZGxpbmVcclxuXHJcbiAgICBAJGNvbnRlbnQgPSBhcHBlbmQgJzxkaXYgY2xhc3M9XCJwaWNrZXJfX2NvbnRlbnRcIiA+PC9kaXY+JywgQCRlbGVtZW50XHJcblxyXG4gICAgQCRtb250aCA9IGFwcGVuZCAnPGRpdiBjbGFzcz1cInBpY2tlcl9fbW9udGhcIiA+PC9kaXY+JywgQCRjb250ZW50XHJcblxyXG4gICAgIyBUT0RPOiBpMThuXHJcbiAgICB3ZWVrZGF5cyA9IG1vbWVudC5sb2NhbGVEYXRhKCkuX3dlZWtkYXlzTWluXHJcblxyXG4gICAgQCR3ZWVrSGVhZGxpbmUgPSBhcHBlbmQgJzxkaXYgY2xhc3M9XCJwaWNrZXJfX3dlZWsgcGlja2VyX193ZWVrLS1oZWFkbGluZVwiPjxkaXYgY2xhc3M9XCJwaWNrZXJfX2RheSBwaWNrZXJfX2RheS0taGVhZGxpbmVcIj4nK3dlZWtkYXlzWzFdKyc8L2Rpdj48ZGl2IGNsYXNzPVwicGlja2VyX19kYXkgcGlja2VyX19kYXktLWhlYWRsaW5lXCI+Jyt3ZWVrZGF5c1syXSsnPC9kaXY+PGRpdiBjbGFzcz1cInBpY2tlcl9fZGF5IHBpY2tlcl9fZGF5LS1oZWFkbGluZVwiPicrd2Vla2RheXNbM10rJzwvZGl2PjxkaXYgY2xhc3M9XCJwaWNrZXJfX2RheSBwaWNrZXJfX2RheS0taGVhZGxpbmVcIj4nK3dlZWtkYXlzWzRdKyc8L2Rpdj48ZGl2IGNsYXNzPVwicGlja2VyX19kYXkgcGlja2VyX19kYXktLWhlYWRsaW5lXCI+Jyt3ZWVrZGF5c1s1XSsnPC9kaXY+PGRpdiBjbGFzcz1cInBpY2tlcl9fZGF5IHBpY2tlcl9fZGF5LS1oZWFkbGluZVwiPicrd2Vla2RheXNbNl0rJzwvZGl2PjxkaXYgY2xhc3M9XCJwaWNrZXJfX2RheSBwaWNrZXJfX2RheS0taGVhZGxpbmVcIj4nK3dlZWtkYXlzWzBdKyc8L2Rpdj48L2Rpdj4nLCBAJG1vbnRoXHJcblxyXG4gICAgIyBAJHdlZWtzID0gYXBwZW5kICc8ZGl2IGNsYXNzPVwicGlja2VyX193ZWVrc1wiID48L2Rpdj4nLCBAJG1vbnRoXHJcblxyXG4gICAgaWYgQGRpc3BsYXlXZWVrXHJcbiAgICAgIEAkd2Vla0hlYWRsaW5lLnByZXBlbmQgJzxkaXYgY2xhc3M9XCJwaWNrZXJfX3dlZWtudW1iZXIgcGlja2VyX193ZWVrbnVtYmVyLS1oZWFkbGluZVwiID48L2Rpdj4nXHJcblxyXG4gICAgQHVwZGF0ZURpc3BsYXkoKVxyXG5cclxuICB1cGRhdGVEaXNwbGF5OiAtPlxyXG4gICAgQCRoZWFkbGluZV9fbW9udGgudGV4dCBAZGF0ZS5mb3JtYXQoJ01NTU0nKVxyXG4gICAgQCRoZWFkbGluZV9feWVhci50ZXh0IEBkYXRlLmZvcm1hdCgnWVlZWScpXHJcblxyXG4gICAgQCRtb250aC5lbXB0eSgpXHJcbiAgICBAJG1vbnRoLmFwcGVuZCBAJHdlZWtIZWFkbGluZVxyXG5cclxuICAgIGRhdGVDbG9uZSA9IEBtb21lbnQgQGRhdGVcclxuICAgIG1vbnRoID0gZGF0ZUNsb25lLmdldCAnbW9udGgnXHJcblxyXG4gICAgIyBzdGFydCBieSB0aGUgZmlyc3QgZGF5IG9mIHRoZSBtb250aFxyXG4gICAgZGF0ZUNsb25lLnNldCAnZGF0ZScsIDFcclxuXHJcbiAgICAjIHJld2luZCB0byB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrXHJcbiAgICBpZiBkYXRlQ2xvbmUuZ2V0KCdkYXknKSA9PSAwXHJcbiAgICAgICMgaWYgdGhlIGN1cnJlbnQgZGF5IGlzIHN1bmRheSAod2VlayBzdGFydCBmb3IgbW9tZW50LmpzKSByZXdpbmQgdG8gbW9uZGF5IFwibGFzdCB3ZWVrXCJcclxuICAgICAgZGF0ZUNsb25lLnNldCAnZGF5JywgLTZcclxuICAgIGVsc2VcclxuICAgICAgZGF0ZUNsb25lLnNldCAnZGF5JywgMVxyXG5cclxuICAgIGxvb3BcclxuICAgICAgJHdlZWsgPSBhcHBlbmQgJzxkaXYgY2xhc3M9XCJwaWNrZXJfX3dlZWtcIiA+PC9kaXY+JywgQCRtb250aFxyXG5cclxuICAgICAgaWYgQGRpc3BsYXlXZWVrXHJcbiAgICAgICAgJHdlZWtudW1iZXIgPSAkICc8ZGl2IGNsYXNzPVwicGlja2VyX193ZWVrbnVtYmVyXCIgPjwvZGl2PidcclxuICAgICAgICAkd2Vla251bWJlci50ZXh0IGRhdGVDbG9uZS5nZXQgJ3dlZWsnXHJcbiAgICAgICAgJHdlZWsucHJlcGVuZCAkd2Vla251bWJlclxyXG5cclxuICAgICAgbG9vcFxyXG5cclxuICAgICAgICBtb2RpZmllciA9IG51bGxcclxuXHJcbiAgICAgICAgY3VycmVudE1vbnRoID0gZGF0ZUNsb25lLmdldCgnbW9udGgnKVxyXG5cclxuICAgICAgICBpZiBjdXJyZW50TW9udGggPCBtb250aFxyXG4gICAgICAgICAgbW9kaWZpZXIgPSAncGlja2VyX19kYXktLXByZXYtbW9udGgnXHJcbiAgICAgICAgZWxzZSBpZiBjdXJyZW50TW9udGggPiBtb250aFxyXG4gICAgICAgICAgbW9kaWZpZXIgPSAncGlja2VyX19kYXktLW5leHQtbW9udGgnXHJcblxyXG4gICAgICAgIGFwcGVuZCBAY3JlYXRlRGF5KGRhdGVDbG9uZSwgbW9kaWZpZXIpLCAkd2Vla1xyXG5cclxuICAgICAgICBkYXRlQ2xvbmUuYWRkIDEsICdkYXlzJ1xyXG5cclxuICAgICAgICBpZiBkYXRlQ2xvbmUuZ2V0KCdkYXknKSA9PSAxICMgdW50aWwgbW9uZGF5XHJcbiAgICAgICAgICBicmVha1xyXG5cclxuICAgICAgaWYgZGF0ZUNsb25lLmdldCgnbW9udGgnKSAhPSBtb250aCAjIHVudGlsIGFub3RoZXIgbW9udGhcclxuICAgICAgICBicmVha1xyXG5cclxuICBjcmVhdGVJY29uOiAoaWNvbk5hbWUpIC0+XHJcbiAgICBpY29uID0gQGljb25zW2ljb25OYW1lXVxyXG5cclxuICAgIGlmICFpY29uP1xyXG4gICAgICAkLmVycm9yIFwiUGxlYXNlIGRlZmluZSB0aGUgXCIgKyBpY29uTmFtZSArIFwiIGljb25cIlxyXG5cclxuICAgICRpY29uID0gJCAnPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPjx1c2UgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeGxpbms6aHJlZj1cIicraWNvbisnXCIgLz48L3N2Zz4nXHJcblxyXG4gICAgIyBjYW4ndCB1c2UgYWRkQ2xhc3MgaGVyZSBzaW5jZSAkaWNvbiBpcyBzdmdcclxuICAgICRpY29uLmF0dHIgJ2NsYXNzJywgJ3BpY2tlcl9faWNvbiBwaWNrZXJfX2ljb24tLScgKyBpY29uTmFtZVxyXG5cclxuICAgIHJldHVybiAkaWNvblxyXG5cclxuICBjcmVhdGVEYXk6IChkLCBtb2RpZmllcikgLT5cclxuICAgIGRhdGUgPSBAbW9tZW50KGQpICMgY3JlYXRlIGEgY2xvbmVcclxuXHJcbiAgICAkZGF5ID0gJCAnPGRpdiBjbGFzcz1cInBpY2tlcl9fZGF5XCIgPjwvZGl2PidcclxuXHJcbiAgICBpZiBtb2RpZmllcj9cclxuICAgICAgJGRheS5hZGRDbGFzcyhtb2RpZmllcilcclxuXHJcbiAgICBpZiBAc2VsZWN0ZWREYXRlPyBhbmQgZGF0ZS5mb3JtYXQoJ0RELk1NLllZWVknKSA9PSBAc2VsZWN0ZWREYXRlLmZvcm1hdCgnREQuTU0uWVlZWScpXHJcbiAgICAgICRkYXkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpXHJcblxyXG4gICAgaWYgZGF0ZS5mb3JtYXQoJ0RELk1NLllZWVknKSA9PSBAbW9tZW50KCkuZm9ybWF0KCdERC5NTS5ZWVlZJylcclxuICAgICAgJGRheS5hZGRDbGFzcygncGlja2VyX19kYXktLXRvZGF5JylcclxuXHJcbiAgICBzZWxmID0gdGhpc1xyXG5cclxuICAgICRkYXkudGV4dCBkYXRlLmdldCAnZGF0ZSdcclxuICAgICRkYXkub24gJ2NsaWNrJywgKGUpIC0+XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG5cclxuICAgICAgc2VsZi5zZXRTZWxlY3RlZERhdGUoZGF0ZSlcclxuICAgICAgc2VsZi5lbWl0ICdzZWxlY3QnLCBkYXRlLmZvcm1hdCgnREQuTU0uWVlZWScpXHJcbiAgICAgIHNlbGYudG9nZ2xlKClcclxuXHJcbiAgICByZXR1cm4gJGRheVxyXG5cclxuICBnZXRET01Ob2RlOiAtPlxyXG4gICAgcmV0dXJuIEAkZWxlbWVudFxyXG5cclxuICB0b2dnbGU6IC0+XHJcbiAgICBAJGVsZW1lbnQudG9nZ2xlQ2xhc3MgJ2lzLWFjdGl2ZSdcclxuXHJcbiAgc2V0U2VsZWN0ZWREYXRlOiAoc2VsZWN0ZWREYXRlKSAtPlxyXG4gICAgQGRhdGUgPSBzZWxlY3RlZERhdGVcclxuICAgIEBzZWxlY3RlZERhdGUgPSBAbW9tZW50KHNlbGVjdGVkRGF0ZSlcclxuICAgIEB1cGRhdGVEaXNwbGF5KClcclxuXHJcbiAgb25QcmV2Q2xpY2s6IChlKSAtPlxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgQGRhdGUuYWRkIC0xLCAnbW9udGhzJ1xyXG4gICAgQHVwZGF0ZURpc3BsYXkoKVxyXG5cclxuICBvbk5leHRDbGljazogKGUpIC0+XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICBAZGF0ZS5hZGQgMSwgJ21vbnRocydcclxuICAgIEB1cGRhdGVEaXNwbGF5KClcclxuXHJcbmNsYXNzIERhdGVwaWNrZXJcclxuXHJcbiAgY29uc3RydWN0b3I6IChlbGVtZW50LCBAbW9tZW50LCBpbnB1dCwgZGlzcGxheVdlZWssIGljb25zKSAtPlxyXG4gICAgQCRlbGVtZW50ID0gJCBlbGVtZW50XHJcblxyXG4gICAgaWYgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQW5kcm9pZC9pKSB8fCBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oaU9TfGlQaG9uZXxpUGFkfGlQb2QpL2kpIHx8IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1dpbmRvd3MgUGhvbmUvaSlcclxuXHJcbiAgICAgIEAkaW5wdXQgPSAkIGlucHV0XHJcblxyXG4gICAgICBAJGlucHV0LnByb3AgJ3R5cGUnLCAnZGF0ZSdcclxuXHJcbiAgICAgIEAkaW5wdXQuZm9jdXMoKVxyXG5cclxuICAgIGVsc2VcclxuXHJcbiAgICAgIEBwaWNrZXIgPSBuZXcgUGlja2VyKEBtb21lbnQsIGRpc3BsYXlXZWVrLCBpY29ucylcclxuXHJcbiAgICAgIGlmIGlucHV0P1xyXG4gICAgICAgIEAkaW5wdXQgPSAkIGlucHV0XHJcblxyXG4gICAgICAgIEAkaW5wdXQub24gJ2NoYW5nZScsIEBvbkNoYW5nZVxyXG5cclxuICAgICAgICBAb25DaGFuZ2UoKVxyXG5cclxuICAgICAgQHBpY2tlci5vbiAnc2VsZWN0JywgKChkYXRlKSAtPlxyXG4gICAgICAgIEAkaW5wdXQudmFsKGRhdGUpXHJcbiAgICAgICAgQCRpbnB1dC50cmlnZ2VyICdjaGFuZ2UnXHJcbiAgICAgICkuYmluZCh0aGlzKVxyXG5cclxuICAgICAgQCRlbGVtZW50LmFwcGVuZCBAcGlja2VyLmdldERPTU5vZGUoKVxyXG5cclxuICBvbkNoYW5nZTogKCkgPT5cclxuICAgIGRhdCA9IEBtb21lbnQoQCRpbnB1dC52YWwoKSwgJ0RELk1NLllZWVknKVxyXG5cclxuICAgIGlmIGRhdC5pc1ZhbGlkKClcclxuICAgICAgQHBpY2tlci5zZXRTZWxlY3RlZERhdGUgZGF0XHJcblxyXG4gIHRvZ2dsZTogKCkgLT5cclxuXHJcbiAgICBAcGlja2VyLnRvZ2dsZSgpXHJcblxyXG4jIFBsdWdpbiBkZWZpbml0aW9uXHJcblBsdWdpbiA9IChvcHRpb25zKSAtPlxyXG4gIG9wdHMgPSAkLmV4dGVuZCgge30sICQuZm4uZGF0ZXBpY2tlci5kZWZhdWx0cywgb3B0aW9ucyApXHJcblxyXG4gIHJldHVybiB0aGlzLmVhY2ggKCkgLT5cclxuICAgICR0aGlzID0gJCh0aGlzKVxyXG4gICAgZGF0YSA9ICR0aGlzLmRhdGEoJ2F4YS5kYXRlcGlja2VyJylcclxuXHJcbiAgICBpZiBub3QgZGF0YVxyXG4gICAgICBpZiBvcHRzLm1vbWVudD9cclxuICAgICAgICBtb21lbnQgPSBvcHRzLm1vbWVudFxyXG4gICAgICBlbHNlIGlmIHdpbmRvdy5tb21lbnQ/XHJcbiAgICAgICAgbW9tZW50ID0gd2luZG93Lm1vbWVudFxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgJC5lcnJvcihcIk1vbWVudC5qcyBtdXN0IGVpdGhlciBiZSBwYXNzZWQgYXMgYW4gb3B0aW9uIG9yIGJlIGF2YWlsYWJsZSBnbG9iYWxseVwiKVxyXG5cclxuICAgICAgZGF0YSA9IG5ldyBEYXRlcGlja2VyKHRoaXMsIG1vbWVudCwgb3B0cy5pbnB1dCwgb3B0cy5kaXNwbGF5V2Vlaywgb3B0cy5pY29ucylcclxuICAgICAgJHRoaXMuZGF0YSgnYXhhLmRhdGVwaWNrZXInLCBkYXRhKVxyXG5cclxuICAgIGlmIG9wdHMuYWN0aW9uP1xyXG4gICAgICBkYXRhW29wdHMuYWN0aW9uXSgpXHJcblxyXG4jIFBsdWdpbiByZWdpc3RyYXRpb25cclxuJC5mbi5kYXRlcGlja2VyID0gUGx1Z2luXHJcbiQuZm4uZGF0ZXBpY2tlci5Db25zdHJ1Y3RvciA9IERhdGVwaWNrZXJcclxuXHJcbiMgREFUQS1BUElcclxuJChkb2N1bWVudCkub24gJ2NsaWNrLmF4YS5kYXRlcGlja2VyLmRhdGEtYXBpJywgJ1tkYXRhLWRhdGVwaWNrZXJdJywgKGUpIC0+XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICR0YXJnZXQgPSAkICQodGhpcykuZGF0YSgnZGF0ZXBpY2tlcicpXHJcblxyXG4gICRpbnB1dCA9ICQgJHRhcmdldC5kYXRhKCdkYXRlcGlja2VyLXdhdGNoJylcclxuXHJcbiAgZGlzcGxheVdlZWsgPSAkdGFyZ2V0LmRhdGEoJ2RhdGVwaWNrZXItZGlzcGxheS13ZWVrJylcclxuXHJcbiAgaWNvbnMgPVxyXG4gICAgcHJldjogJHRhcmdldC5kYXRhKCdkYXRlcGlja2VyLWljb24tcHJldicpXHJcbiAgICBuZXh0OiAkdGFyZ2V0LmRhdGEoJ2RhdGVwaWNrZXItaWNvbi1uZXh0JylcclxuXHJcbiAgZGlzcGxheVdlZWsgPSBkaXNwbGF5V2VlayAmJiBkaXNwbGF5V2VlayAhPSAnZmFsc2UnXHJcblxyXG4gIFBsdWdpbi5jYWxsKCR0YXJnZXQsIHsgaW5wdXQ6ICRpbnB1dCwgYWN0aW9uOiAndG9nZ2xlJywgZGlzcGxheVdlZWs6IGRpc3BsYXlXZWVrLCBpY29uczogaWNvbnMgfSlcclxuXHJcbiMhIENvcHlyaWdodCBBWEEgVmVyc2ljaGVydW5nZW4gQUcgMjAxNVxyXG4iLCJpbXBvcnQgJCBmcm9tICdqcXVlcnknXHJcblxyXG5jbGFzcyBEcm9wZG93biB7XHJcbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xyXG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudClcclxuXHJcbiAgICB0aGlzLiRsYWJlbCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtZHJvcGRvd24tbGFiZWxdJylcclxuICAgIHRoaXMuJHRleHQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWRyb3Bkb3duLXRleHRdJylcclxuICAgIHRoaXMuJHNlbGVjdCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtZHJvcGRvd24tc2VsZWN0XScpXHJcblxyXG4gICAgdGhpcy5pbml0KClcclxuICB9XHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3RhYmluZGV4JywgJzAnKVxyXG4gICAgdGhpcy4kc2VsZWN0LmF0dHIoJ3RhYmluZGV4JywgJy0xJylcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdpcy1lbmhhbmNlZCcpXHJcbiAgICB0aGlzLiRsYWJlbC5hZGRDbGFzcygnaXMtZW5oYW5jZWQnKVxyXG4gICAgdGhpcy4kdGV4dC5hZGRDbGFzcygnaXMtZW5oYW5jZWQnKVxyXG4gICAgdGhpcy4kc2VsZWN0LmFkZENsYXNzKCdpcy1lbmhhbmNlZCcpXHJcbiAgICB0aGlzLnNldExhYmVsVGV4dCgpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5vbigna2V5ZG93bicsIChlKSA9PiB0aGlzLmhhbmRsZUtleURvd24oZSkpXHJcbiAgICB0aGlzLiRzZWxlY3Qub24oJ2NoYW5nZScsICgpID0+IHRoaXMuc2V0TGFiZWxUZXh0KCkpXHJcbiAgfVxyXG5cclxuICBoYW5kbGVLZXlEb3duKGUpIHtcclxuICAgIGlmIChlLndoaWNoID09IDMyKSB7XHJcbiAgICAgIHRoaXMuJHNlbGVjdC5mb2N1cygpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZXRMYWJlbFRleHQoKSB7XHJcbiAgICBsZXQgdmFsdWUgPSB0aGlzLiRzZWxlY3QuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykudGV4dCgpXHJcbiAgICB0aGlzLiR0ZXh0LnRleHQodmFsdWUpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBQbHVnaW4oKSB7XHJcbiAgbGV0IHBhcmFtcyA9IGFyZ3VtZW50c1xyXG5cclxuICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCAkdGhpcyA9ICQodGhpcylcclxuICAgIGxldCBkYXRhID0gJHRoaXMuZGF0YSgnYXhhLmRyb3Bkb3duJylcclxuXHJcbiAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgZGF0YSA9IG5ldyBEcm9wZG93bih0aGlzKVxyXG4gICAgICAkdGhpcy5kYXRhKCdheGEuZHJvcGRvd24nLCBkYXRhKVxyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuXHJcbiQuZm4uZHJvcGRvd24gPSBQbHVnaW5cclxuJC5mbi5kcm9wZG93bi5Db25zdHJ1Y3RvciA9IERyb3Bkb3duXHJcblxyXG4kKGZ1bmN0aW9uICgpIHtcclxuICAkKCdbZGF0YS1kcm9wZG93bl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCAkZHJvcGRvd24gPSAkKHRoaXMpXHJcbiAgICBQbHVnaW4uY2FsbCgkZHJvcGRvd24pXHJcbiAgfSlcclxufSlcclxuXHJcbi8vIENvcHlyaWdodCBBWEEgVmVyc2ljaGVydW5nZW4gQUcgMjAxNVxyXG4iLCIkID0gcmVxdWlyZSAnanF1ZXJ5J1xyXG5cclxuIyBQdWJsaWMgY2xhc3MgZGVmaW5pdGlvblxyXG5jbGFzcyBEcm9wem9uZVxyXG5cclxuICBjb25zdHJ1Y3RvcjogKGVsZW1lbnQsIG9wdGlvbnMpIC0+XHJcbiAgICBAZWxlbWVudCA9IGVsZW1lbnRcclxuICAgIEAkZWxlbWVudCA9ICQgZWxlbWVudFxyXG4gICAgQG9wdGlvbnMgPSAkLmV4dGVuZCB7fSwgb3B0aW9uc1xyXG5cclxuICAgIEBpbml0KClcclxuXHJcbiAgaW5pdDogKCkgLT5cclxuICAgIEAkZWxlbWVudC5iaW5kICdkcmFnb3ZlcicsIEAsIChldmVudCkgLT5cclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgICBldmVudC5kYXRhLiRlbGVtZW50LmFkZENsYXNzICdkcm9wem9uZV9fY29udGFpbmVyLS1kcmFnb3ZlcidcclxuXHJcbiAgICBAJGVsZW1lbnQuYmluZCAnZHJhZ2xlYXZlJywgQCwgKGV2ZW50KSAtPlxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgIGV2ZW50LmRhdGEuJGVsZW1lbnQucmVtb3ZlQ2xhc3MgJ2Ryb3B6b25lX19jb250YWluZXItLWRyYWdvdmVyJ1xyXG5cclxuICAgIEAkZWxlbWVudC5vbiAnZHJvcCcsIEAsIChldmVudCkgLT5cclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgICBldmVudC5kYXRhLiRlbGVtZW50LnJlbW92ZUNsYXNzICdkcm9wem9uZV9fY29udGFpbmVyLS1kcmFnb3ZlcidcclxuXHJcbiMgUGx1Z2luIGRlZmluaXRpb25cclxuUGx1Z2luID0gKG9wdGlvbikgLT5cclxuICBwYXJhbXMgPSBhcmd1bWVudHNcclxuXHJcbiAgcmV0dXJuIHRoaXMuZWFjaCAoKSAtPlxyXG4gICAgJHRoaXMgPSAkIHRoaXNcclxuICAgIGRhdGEgPSAkdGhpcy5kYXRhKCdheGEuZHJvcHpvbmUnKVxyXG5cclxuICAgIGlmIG5vdCBkYXRhXHJcbiAgICAgIGRhdGEgPSBuZXcgRHJvcHpvbmUgdGhpc1xyXG4gICAgICAkdGhpcy5kYXRhICdheGEuZHJvcHpvbmUnLCBkYXRhXHJcblxyXG4jIFBsdWdpbiByZWdpc3RyYXRpb25cclxuJC5mbi5kcm9wem9uZSA9IFBsdWdpblxyXG4kLmZuLmRyb3B6b25lLkNvbnN0cnVjdG9yID0gRHJvcHpvbmVcclxuXHJcbiMgREFUQS1BUElcclxuJCh3aW5kb3cpLm9uICdsb2FkJywgKCkgLT5cclxuICAkKCdbZGF0YS1kcm9wem9uZT1cImRyb3B6b25lXCJdJykuZWFjaCAoKSAtPlxyXG4gICAgJGRyb3B6b25lID0gJCh0aGlzKVxyXG4gICAgUGx1Z2luLmNhbGwoJGRyb3B6b25lKVxyXG5cclxuIyEgQ29weXJpZ2h0IEFYQSBWZXJzaWNoZXJ1bmdlbiBBRyAyMDE1XHJcbiIsIiQgPSByZXF1aXJlICdqcXVlcnknXHJcblxyXG4jIFB1YmxpYyBjbGFzcyBkZWZpbml0aW9uXHJcbmNsYXNzIElFOVNwaW5uZXJcclxuXHJcbiAgY29uc3RydWN0b3I6IChlbGVtZW50LCBvcHRpb25zKSAtPlxyXG4gICAgQCRlbGVtZW50ID0gJCBlbGVtZW50XHJcblxyXG4gICAgQCRlbGVtZW50LmFkZENsYXNzICdpcy1mYWxsYmFjay1hY3RpdmUnXHJcblxyXG4jIFBsdWdpbiBkZWZpbml0aW9uXHJcblBsdWdpbiA9IChvcHRpb24pIC0+XHJcbiAgcGFyYW1zID0gYXJndW1lbnRzXHJcblxyXG4gIHJldHVybiB0aGlzLmVhY2ggKCkgLT5cclxuICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGF0YSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXHJcbiAgICBhY3Rpb24gPSBvcHRpb24gaWYgdHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJ1xyXG5cclxuICAgICR0aGlzID0gJCB0aGlzXHJcbiAgICBkYXRhID0gJHRoaXMuZGF0YSgnYXhhLmllOVNwaW5uZXInKVxyXG5cclxuICAgIGlmIG5vdCBkYXRhXHJcbiAgICAgIGRhdGEgPSBuZXcgSUU5U3Bpbm5lciB0aGlzLCBvcHRpb25zXHJcbiAgICAgICR0aGlzLmRhdGEgJ2F4YS5pZTlTcGlubmVyJywgZGF0YVxyXG5cclxuIyBQbHVnaW4gcmVnaXN0cmF0aW9uXHJcbiQuZm4uaWU5U3Bpbm5lciA9IFBsdWdpblxyXG4kLmZuLmllOVNwaW5uZXIuQ29uc3RydWN0b3IgPSBJRTlTcGlubmVyXHJcblxyXG4jIERBVEEtQVBJXHJcbiQod2luZG93KS5vbiAnbG9hZCcsICgpIC0+XHJcbiAgI2NoZWNrIGZvciBzdXBwb3J0IG9mIHRoZSBhbmltYXRpb24gcHJvcGVydHlcclxuICBlbG0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdkaXYnXHJcbiAgcHJvcGVydGllcyA9IFtcclxuICAgICdhbmltYXRpb24nXHJcbiAgICAnV2Via2l0QW5pbWF0aW9uJ1xyXG4gICAgJ01vekFuaW1hdGlvbidcclxuICAgICdtc0FuaW1hdGlvbidcclxuICAgICdPQW5pbWF0aW9uJ1xyXG4gIF1cclxuICBmb3IgcHJvcGVydHkgaW4gcHJvcGVydGllc1xyXG4gICAgaWYgZWxtLnN0eWxlW3Byb3BlcnR5XT9cclxuICAgICAgI2lmIHRoZSBhbmltYXRpb24gcHJvcGVydHkgaXMgc3VwcG9ydGVkLCBleGl0XHJcbiAgICAgIHJldHVyblxyXG5cclxuICAjYW5pbWF0aW9uIHByb3BlcnR5IG5vdCBzdXBwb3J0ZWQsIGFjdGl2YXRlIGZhbGxiYWNrIG9uIGFsbCBzcGlubmVyc1xyXG4gICQoJ1tkYXRhLXNwaW5uZXJdJykuZWFjaCAoKSAtPlxyXG4gICAgJHNwaW5uZXIgPSAkKHRoaXMpXHJcbiAgICBQbHVnaW4uY2FsbCgkc3Bpbm5lcilcclxuXHJcbiMhIENvcHlyaWdodCBBWEEgVmVyc2ljaGVydW5nZW4gQUcgMjAxNVxyXG4iLCJyZXF1aXJlKCdzdmc0ZXZlcnlib2R5JylcclxuXHJcbnJlcXVpcmUoJy4vYWZmaXgnKVxyXG5yZXF1aXJlKCcuL2F1dG9jb21wbGV0ZScpXHJcbnJlcXVpcmUoJy4vYXV0b2dyb3cnKVxyXG5yZXF1aXJlKCcuL2NoZWNrYm94JylcclxucmVxdWlyZSgnLi9kYXRlcGlja2VyJylcclxucmVxdWlyZSgnLi9kcm9wZG93bicpXHJcbnJlcXVpcmUoJy4vZHJvcHpvbmUnKVxyXG5yZXF1aXJlKCcuL2llOS1zcGlubmVyJylcclxucmVxdWlyZSgnLi9pbmZvJylcclxucmVxdWlyZSgnLi9tZW51LWNvbGxhcHNpbmcnKVxyXG5yZXF1aXJlKCcuL21lbnUtbWFpbicpXHJcbnJlcXVpcmUoJy4vbWVudS1zbGlkaW5nJylcclxucmVxdWlyZSgnLi9tb2RhbCcpXHJcbnJlcXVpcmUoJy4vbm90aWZpY2F0aW9uJylcclxucmVxdWlyZSgnLi9wb3BvdmVyJylcclxucmVxdWlyZSgnLi9zZWdtZW50ZWQtY29udHJvbCcpXHJcbnJlcXVpcmUoJy4vc2l0ZScpXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7fVxyXG4iLCIkID0gcmVxdWlyZSAnanF1ZXJ5J1xyXG5cclxuIyBQdWJsaWMgY2xhc3MgZGVmaW5pdGlvblxyXG5jbGFzcyBJbmZvXHJcblxyXG4gIGNvbnN0cnVjdG9yOiAoZWxlbWVudCwgb3B0aW9ucykgLT5cclxuICAgIEAkZWxlbWVudCA9ICQgZWxlbWVudFxyXG4gICAgIyBAb3B0aW9ucyA9ICQuZXh0ZW5kIHt9LCBvcHRpb25zXHJcblxyXG4gICAgc2VsZWN0b3IgPSBAJGVsZW1lbnQuZGF0YSAndGFyZ2V0J1xyXG4gICAgc2VsZWN0b3IgPSBvcHRpb25zLnRhcmdldCBpZiBub3Qgc2VsZWN0b3I/XHJcblxyXG4gICAgQCR0YXJnZXQgPSAkIHNlbGVjdG9yXHJcblxyXG4gICAgQCRlbGVtZW50Lm9uICdjbGljaycsIEAsIChldmVudCkgLT5cclxuICAgICAgZXZlbnQuZGF0YS50b2dnbGUgZXZlbnRcclxuXHJcbiAgdG9nZ2xlOiAoKSAtPlxyXG4gICAgQCR0YXJnZXQuc2xpZGVUb2dnbGUoKVxyXG4gICAgQCRlbGVtZW50LnRvZ2dsZUNsYXNzICdpcy1hY3RpdmUnXHJcblxyXG4jIFBsdWdpbiBkZWZpbml0aW9uXHJcblBsdWdpbiA9IChvcHRpb24pIC0+XHJcbiAgcGFyYW1zID0gYXJndW1lbnRzXHJcblxyXG4gIHJldHVybiB0aGlzLmVhY2ggKCkgLT5cclxuICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGF0YSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXHJcbiAgICBhY3Rpb24gPSBvcHRpb24gaWYgdHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJ1xyXG5cclxuICAgICR0aGlzID0gJCB0aGlzXHJcbiAgICBkYXRhID0gJHRoaXMuZGF0YSgnYXhhLmluZm8nKVxyXG5cclxuICAgIGlmIG5vdCBkYXRhXHJcbiAgICAgIGRhdGEgPSBuZXcgSW5mbyB0aGlzLCBvcHRpb25zXHJcbiAgICAgICR0aGlzLmRhdGEgJ2F4YS5pbmZvJywgZGF0YVxyXG5cclxuIyBQbHVnaW4gcmVnaXN0cmF0aW9uXHJcbiQuZm4uaW5mbyA9IFBsdWdpblxyXG4kLmZuLmluZm8uQ29uc3RydWN0b3IgPSBJbmZvXHJcblxyXG4jIERBVEEtQVBJXHJcbiQod2luZG93KS5vbiAnbG9hZCcsICgpIC0+XHJcbiAgJCgnW2RhdGEtaW5mb10nKS5lYWNoICgpIC0+XHJcbiAgICAkaW5mbyA9ICQodGhpcylcclxuICAgIFBsdWdpbi5jYWxsKCRpbmZvKVxyXG5cclxuIyEgQ29weXJpZ2h0IEFYQSBWZXJzaWNoZXJ1bmdlbiBBRyAyMDE1XHJcbiIsIiQgPSByZXF1aXJlICdqcXVlcnknXHJcblxyXG4jIFB1YmxpYyBjbGFzcyBkZWZpbml0aW9uXHJcbmNsYXNzIENvbGxhcHNpbmdNZW51XHJcbiAgQERFRkFVTFRTOlxyXG4gICAgZXhjbHVzaXZlOiBmYWxzZVxyXG5cclxuICBjb25zdHJ1Y3RvcjogKGVsZW1lbnQsIG9wdGlvbnMpIC0+XHJcbiAgICBAJGVsZW1lbnQgPSAkIGVsZW1lbnRcclxuICAgIEBvcHRpb25zID0gJC5leHRlbmQge30sIENvbGxhcHNpbmdNZW51LkRFRkFVTFRTLCBvcHRpb25zXHJcblxyXG4gICAgQGluaXQoKVxyXG5cclxuICBpbml0OiAoKSAtPlxyXG4gICAgQCRlbGVtZW50Lm9uICdjbGljaycsICdbZGF0YS1saW5rXScsIEAsIChldmVudCkgLT5cclxuICAgICAgbGluayA9ICQoZXZlbnQudGFyZ2V0KVxyXG4gICAgICBzdWJMZXZlbCA9IGxpbmsuc2libGluZ3MoJ1tkYXRhLWxldmVsXScpXHJcblxyXG4gICAgICBpZiBzdWJMZXZlbC5sZW5ndGggPiAwXHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGV2ZW50LmRhdGEudG9nZ2xlKHN1YkxldmVsKVxyXG5cclxuICB0b2dnbGU6ICh0b1NldCkgLT5cclxuICAgIGxldmVsID0gQCRlbGVtZW50LmZpbmQgdG9TZXRcclxuXHJcbiAgICB0aHJvdyBuZXcgRXJyb3IgJ1Byb3ZpZGVkIGxldmVsIG5vdCBpbiBtZW51IScgaWYgbm90IGxldmVsXHJcblxyXG4gICAgcGFyZW50TGlua3MgPSBsZXZlbC5wYXJlbnRzVW50aWwoQCRlbGVtZW50LCAnW2RhdGEtbGlua10nKVxyXG4gICAgcGFyZW50TGV2ZWxzID0gbGV2ZWwucGFyZW50c1VudGlsKEAkZWxlbWVudCwgJ1tkYXRhLWxldmVsXScpXHJcblxyXG4gICAgc2hvdWxkT3BlbiA9IG5vdCBsZXZlbC5oYXNDbGFzcygnaXMtb3BlbicpXHJcblxyXG4gICAgaWYgc2hvdWxkT3BlbiBhbmQgQG9wdGlvbnMuZXhjbHVzaXZlXHJcbiAgICAgIEAkZWxlbWVudC5maW5kKCdbZGF0YS1sZXZlbF0nKS5ub3QocGFyZW50TGV2ZWxzKVxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnaXMtb3BlbicpXHJcbiAgICAgICAgLnNpYmxpbmdzKCdbZGF0YS1saW5rXScpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKVxyXG5cclxuICAgIGxldmVsLnRvZ2dsZUNsYXNzKCdpcy1vcGVuJywgc2hvdWxkT3BlbilcclxuICAgICAgLnNpYmxpbmdzKCdbZGF0YS1saW5rXScpLnRvZ2dsZUNsYXNzKCdpcy1hY3RpdmUnLCBzaG91bGRPcGVuKVxyXG5cclxuIyBQbHVnaW4gZGVmaW5pdGlvblxyXG5QbHVnaW4gPSAob3B0aW9uKSAtPlxyXG4gIHBhcmFtcyA9IGFyZ3VtZW50c1xyXG5cclxuICByZXR1cm4gdGhpcy5lYWNoICgpIC0+XHJcbiAgICAkdGhpcyA9ICQgdGhpc1xyXG4gICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBDb2xsYXBzaW5nTWVudS5ERUZBVUxUUywgZGF0YSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXHJcbiAgICBhY3Rpb24gPSBvcHRpb24gaWYgdHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJ1xyXG4gICAgZGF0YSA9ICR0aGlzLmRhdGEoJ2F4YS5tZW51JylcclxuXHJcbiAgICBpZiBub3QgZGF0YVxyXG4gICAgICBkYXRhID0gbmV3IENvbGxhcHNpbmdNZW51IHRoaXMsIG9wdGlvbnNcclxuICAgICAgJHRoaXMuZGF0YSAnYXhhLm1lbnUnLCBkYXRhXHJcblxyXG4gICAgaWYgYWN0aW9uID09ICd0b2dnbGUnXHJcbiAgICAgIGRhdGEudG9nZ2xlKHBhcmFtc1sxXSlcclxuXHJcbiMgUGx1Z2luIHJlZ2lzdHJhdGlvblxyXG4kLmZuLmNvbGxhcHNpbmdNZW51ID0gUGx1Z2luXHJcbiQuZm4uY29sbGFwc2luZ01lbnUuQ29uc3RydWN0b3IgPSBDb2xsYXBzaW5nTWVudVxyXG5cclxuIyBEQVRBLUFQSVxyXG4kKHdpbmRvdykub24gJ2xvYWQnLCAoKSAtPlxyXG4gICQoJ1tkYXRhLW1lbnU9XCJjb2xsYXBzaW5nXCJdJykuZWFjaCAoKSAtPlxyXG4gICAgJG1lbnUgPSAkKHRoaXMpXHJcbiAgICBkYXRhID0gJG1lbnUuZGF0YSgpXHJcblxyXG4gICAgUGx1Z2luLmNhbGwoJG1lbnUsIGRhdGEpXHJcblxyXG4jISBDb3B5cmlnaHQgQVhBIFZlcnNpY2hlcnVuZ2VuIEFHIDIwMTVcclxuIiwiaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xyXG5pbXBvcnQgQmFjb24gZnJvbSAnYmFjb25qcydcclxuXHJcbmNsYXNzIE1haW5NZW51IHtcclxuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy4kaXRlbXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWl0ZW1dJylcclxuICAgIHRoaXMuJGxpbmtzID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1saW5rXScpXHJcbiAgICB0aGlzLiRwYW5lbHMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXBhbmVsXScpXHJcbiAgICB0aGlzLmluaXQoKVxyXG4gIH1cclxuXHJcbiAgaW5pdCgpIHtcclxuICAgIGxldCBjdXJyZW50bHlPcGVuID0gdGhpcy4kaXRlbXNcclxuICAgICAgLmFzRXZlbnRTdHJlYW0oJ21vdXNlZW50ZXInKVxyXG4gICAgICAubWVyZ2UodGhpcy4kaXRlbXMuYXNFdmVudFN0cmVhbSgnbW91c2VsZWF2ZScpKVxyXG4gICAgICAudGhyb3R0bGUoMTAwKVxyXG4gICAgICAubWFwKChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6IGUudHlwZSxcclxuICAgICAgICAgICRlOiAkKGUuY3VycmVudFRhcmdldClcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICAgIC5zY2FuKG51bGwsIChvcGVuLCBldmVudCkgPT4ge1xyXG4gICAgICAgIGlmIChldmVudC50eXBlID09ICdtb3VzZWVudGVyJyB8fCBldmVudC50eXBlID09ICdtb3VzZW92ZXInKVxyXG4gICAgICAgICAgcmV0dXJuIGV2ZW50LiRlXHJcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT0gJ21vdXNlbGVhdmUnKVxyXG4gICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgfSlcclxuXHJcbiAgICBjdXJyZW50bHlPcGVuLm9uVmFsdWUoKG9wZW4pID0+IHtcclxuICAgICAgdGhpcy5vcGVuKG9wZW4pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgb3BlbigkaXRlbU9yTnVsbCkge1xyXG4gICAgbGV0ICRpdGVtID0gJCgpXHJcblxyXG4gICAgaWYgKCRpdGVtT3JOdWxsKSB7XHJcbiAgICAgICRpdGVtID0gdGhpcy4kaXRlbXMuZmlsdGVyKCRpdGVtT3JOdWxsKVxyXG4gICAgICBpZiAoISRpdGVtKSB0aHJvdyBuZXcgRXJyb3IoJ3BsZWFzZSBwcm92aWRlIGVpdGhlciBhIGxpbmssIGEgcGFuZWwgb3IgbnVsbCcpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kaXRlbXMuZWFjaCgoaSwgZSkgPT4ge1xyXG4gICAgICBsZXQgJGUgPSAkKGUpXHJcbiAgICAgIGxldCB0b2dnbGVDbGFzcyA9ICRlLmlzKCRpdGVtKVxyXG5cclxuICAgICAgJGUuZmluZCgnW2RhdGEtcGFuZWxdJykudG9nZ2xlQ2xhc3MoJ2lzLW9wZW4nLCB0b2dnbGVDbGFzcylcclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBQbHVnaW4oKSB7XHJcbiAgbGV0IHBhcmFtcyA9IGFyZ3VtZW50c1xyXG5cclxuICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCAkdGhpcyA9ICQodGhpcylcclxuICAgIGxldCBkYXRhID0gJHRoaXMuZGF0YSgnYWVtLm1lbnUnKVxyXG5cclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICBkYXRhID0gbmV3IE1haW5NZW51KHRoaXMpXHJcbiAgICAgICR0aGlzLmRhdGEoJ2FlbS5tZW51JywgZGF0YSlcclxuICAgIH1cclxuICB9KVxyXG59XHJcblxyXG4kLmZuLm1haW5NZW51ID0gUGx1Z2luXHJcbiQuZm4ubWFpbk1lbnUuQ29uc3RydWN0b3IgPSBNYWluTWVudVxyXG5cclxuJChmdW5jdGlvbiAoKSB7XHJcbiAgJCgnW2RhdGEtbWVudT1cIm1haW5cIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCAkbWVudSA9ICQodGhpcylcclxuICAgIFBsdWdpbi5jYWxsKCRtZW51KVxyXG4gIH0pXHJcbn0pXHJcblxyXG4vLyBDb3B5cmlnaHQgQVhBIFZlcnNpY2hlcnVuZ2VuIEFHIDIwMTVcclxuIiwiaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xyXG5cclxuY2xhc3MgU2xpZGluZ01lbnUge1xyXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXHJcblxyXG4gICAgdGhpcy5pbml0KClcclxuXHJcbiAgICBsZXQgJGN1cnJlbnRMZXZlbCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWN1cnJlbnQnKVxyXG4gICAgbGV0ICR1cHBlcm1vc3RMZXZlbCA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJ1tkYXRhLWxldmVsXScpXHJcblxyXG4gICAgdGhpcy5sZXZlbCgoJGN1cnJlbnRMZXZlbC5sZW5ndGggPiAwID8gJGN1cnJlbnRMZXZlbCA6ICR1cHBlcm1vc3RMZXZlbCkpXHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAoZSkgPT4gdGhpcy5vbldpbmRvd1Jlc2l6ZShlKSlcclxuICB9XHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljaycsICdbZGF0YS1iYWNrXScsIHRoaXMsIChldmVudCkgPT4ge1xyXG4gICAgICBsZXQgbGluayA9ICQoZXZlbnQudGFyZ2V0KVxyXG4gICAgICBsZXQgY3VycmVudExldmVsID0gbGluay5jbG9zZXN0KCdbZGF0YS1sZXZlbF0nKVxyXG4gICAgICBsZXQgdXBwZXJMZXZlbCA9IGN1cnJlbnRMZXZlbC5wYXJlbnQoKS5jbG9zZXN0KCdbZGF0YS1sZXZlbF0nKVxyXG5cclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgICBldmVudC5kYXRhLmxldmVsKHVwcGVyTGV2ZWwpXHJcbiAgICB9KVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrJywgJ1tkYXRhLWxpbmtdJywgdGhpcywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIGxldCBsaW5rID0gJChldmVudC50YXJnZXQpXHJcbiAgICAgIGxldCBzdWJMZXZlbCA9IGxpbmsuc2libGluZ3MoJ1tkYXRhLWxldmVsXScpXHJcblxyXG4gICAgICBpZiAoc3ViTGV2ZWwubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBldmVudC5kYXRhLmxldmVsKHN1YkxldmVsKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgb25XaW5kb3dSZXNpemUoZSkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5jc3MoJ2hlaWdodCcsIHRoaXMubGV2ZWwoKS5vdXRlckhlaWdodCgpKVxyXG4gIH1cclxuXHJcbiAgbGV2ZWwodG9TZXQpIHtcclxuICAgIGlmICghdG9TZXQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWN1cnJlbnQnKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWN1cnJlbnQnKS5yZW1vdmVDbGFzcygnaXMtY3VycmVudCcpXHJcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWxldmVsXScpLmNzcygnbGVmdCcsICcnKVxyXG5cclxuICAgIGxldCBsdmwgPSB0aGlzLiRlbGVtZW50LmZpbmQodG9TZXQpXHJcblxyXG4gICAgaWYgKCFsdmwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm92aWRlZCBsZXZlbCBub3QgaW4gbWVudSEnKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQuY3NzKCdoZWlnaHQnLCBsdmwub3V0ZXJIZWlnaHQoKSlcclxuXHJcbiAgICBsZXQgcGFyZW50TGV2ZWxzID0gbHZsLnBhcmVudHNVbnRpbCh0aGlzLiRlbGVtZW50LCAnW2RhdGEtbGV2ZWxdJylcclxuICAgIGxldCBwYXJlbnRMaW5rcyA9IGx2bC5wYXJlbnRzVW50aWwodGhpcy4kZWxlbWVudCwgJ1tkYXRhLWxpbmtdJylcclxuXHJcbiAgICBsZXQgbGVmdCA9IC0xMDAgKiBwYXJlbnRMZXZlbHMubGVuZ3RoXHJcbiAgICB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCdbZGF0YS1sZXZlbF0nKS5jc3MoJ2xlZnQnLCBgJHtsZWZ0fSVgKVxyXG5cclxuICAgIGx2bC5hZGRDbGFzcygnaXMtY3VycmVudCcpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBQbHVnaW4oKSB7XHJcbiAgbGV0IHBhcmFtcyA9IGFyZ3VtZW50c1xyXG5cclxuICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCAkdGhpcyA9ICQodGhpcylcclxuICAgIGxldCBkYXRhID0gJHRoaXMuZGF0YSgnYXhhLm1lbnUnKVxyXG5cclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICBkYXRhID0gbmV3IFNsaWRpbmdNZW51KHRoaXMpXHJcbiAgICAgICR0aGlzLmRhdGEoJ2F4YS5tZW51JywgZGF0YSlcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbWV0aG9kID0gcGFyYW1zWzBdXHJcbiAgICBpZiAodHlwZW9mKG1ldGhvZCkgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIGxldCBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwocGFyYW1zLCAxKVxyXG4gICAgICBkYXRhW21ldGhvZF0oLi4uYXJncylcclxuICAgIH1cclxuICB9KVxyXG59XHJcblxyXG4kLmZuLnNsaWRpbmdNZW51ID0gUGx1Z2luXHJcbiQuZm4uc2xpZGluZ01lbnUuQ29uc3RydWN0b3IgPSBTbGlkaW5nTWVudVxyXG5cclxuJChmdW5jdGlvbiAoKSB7XHJcbiAgJCgnW2RhdGEtbWVudT1cInNsaWRpbmdcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCAkbWVudSA9ICQodGhpcylcclxuICAgIFBsdWdpbi5jYWxsKCRtZW51KVxyXG4gIH0pXHJcbn0pXHJcblxyXG4vLyBDb3B5cmlnaHQgQVhBIFZlcnNpY2hlcnVuZ2VuIEFHIDIwMTVcclxuIiwiJCA9IHJlcXVpcmUgJ2pxdWVyeSdcclxuXHJcbmNsYXNzIE1vZGFsXHJcblxyXG4gIGNvbnN0cnVjdG9yOiAoZWxlbWVudCwgb3B0aW9ucykgLT5cclxuICAgIEAkZWxlbWVudCA9ICQoZWxlbWVudClcclxuXHJcbiAgdG9nZ2xlOiAoKSAtPlxyXG5cclxuICAgIGlmIEAkZWxlbWVudC5oYXNDbGFzcyAnaXMtYWN0aXZlJ1xyXG4gICAgICBAJGVsZW1lbnQucmVtb3ZlQ2xhc3MgJ2lzLWFjdGl2ZSdcclxuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzICdpcy1tb2RhbC1vcGVuJ1xyXG4gICAgZWxzZVxyXG4gICAgICBAJGVsZW1lbnQuYWRkQ2xhc3MgJ2lzLWFjdGl2ZSdcclxuICAgICAgJCgnYm9keScpLmFkZENsYXNzICdpcy1tb2RhbC1vcGVuJ1xyXG5cclxuIyBQbHVnaW4gZGVmaW5pdGlvblxyXG5QbHVnaW4gPSAob3B0aW9uKSAtPlxyXG4gIHBhcmFtcyA9IGFyZ3VtZW50c1xyXG5cclxuICByZXR1cm4gdGhpcy5lYWNoICgpIC0+XHJcbiAgICAkdGhpcyA9ICQodGhpcylcclxuICAgIGRhdGEgPSAkdGhpcy5kYXRhKCdheGEubW9kYWwnKVxyXG5cclxuICAgIGlmIG5vdCBkYXRhXHJcbiAgICAgIGRhdGEgPSBuZXcgTW9kYWwodGhpcylcclxuICAgICAgJHRoaXMuZGF0YSgnYXhhLm1vZGFsJywgZGF0YSlcclxuXHJcbiAgICBpZiB0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnXHJcbiAgICAgIGRhdGFbb3B0aW9uXSgpXHJcblxyXG4jIFBsdWdpbiByZWdpc3RyYXRpb25cclxuJC5mbi5tb2RhbCA9IFBsdWdpblxyXG4kLmZuLm1vZGFsLkNvbnN0cnVjdG9yID0gTW9kYWxcclxuXHJcbiMgREFUQS1BUElcclxuJChkb2N1bWVudCkub24gJ2NsaWNrLmF4YS5tb2RhbC5kYXRhLWFwaScsICdbZGF0YS1tb2RhbF0nLCAoZSkgLT5cclxuICBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgJHRhcmdldCA9ICQgJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ21vZGFsJylcclxuXHJcbiAgUGx1Z2luLmNhbGwoJHRhcmdldCwgJ3RvZ2dsZScpXHJcblxyXG4jISBDb3B5cmlnaHQgQVhBIFZlcnNpY2hlcnVuZ2VuIEFHIDIwMTVcclxuIiwiJCA9IHJlcXVpcmUgJ2pxdWVyeSdcclxuXHJcbmNsYXNzIE5vdGlmaWNhdGlvblBhbmVcclxuXHJcbiAgY29uc3RydWN0b3I6IChlbGVtZW50LCBvcHRpb25zKSAtPlxyXG4gICAgQCRlbGVtZW50ID0gJCBlbGVtZW50XHJcbiAgICBjb25zb2xlLmxvZyBAJGVsZW1lbnRcclxuICAgIEBwYXRoID0ge1xyXG4gICAgICBpbmZvOiBAJGVsZW1lbnQuZGF0YSAnbm90aWZpY2F0aW9uLWluZm8nXHJcbiAgICAgIHN1Y2Nlc3M6IEAkZWxlbWVudC5kYXRhICdub3RpZmljYXRpb24tc3VjY2VzcydcclxuICAgICAgZXJyb3I6IEAkZWxlbWVudC5kYXRhICdub3RpZmljYXRpb24tZXJyb3InXHJcbiAgICB9XHJcbiAgICAjQHBhdGguaW5mbyA9IEAkZWxlbWVudC5kYXRhICdub3RpZmljYXRpb24taW5mbydcclxuICAgICNAcGF0aC5zdWNjZXNzID0gQCRlbGVtZW50LmRhdGEgJ25vdGlmaWNhdGlvbi1zdWNjZXNzJ1xyXG4gICAgI0BwYXRoLmVycm9yID0gQCRlbGVtZW50LmRhdGEgJ25vdGlmaWNhdGlvbi1lcnJvcidcclxuXHJcbiAgZGlzcGxheU5vdGlmaWNhdGlvbjogKG5vdGlmaWNhdGlvbikgLT5cclxuXHJcbiAgICBpZiAhbm90aWZpY2F0aW9uP1xyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICAkbm90aWZpY2F0aW9uID0gJCAnPGRpdiBjbGFzcz1cIm5vdGlmaWNhdGlvbnNfX2l0ZW1cIiA+PC9kaXY+J1xyXG4gICAgJGljb24gPSBudWxsXHJcblxyXG4gICAgaWYgbm90aWZpY2F0aW9uLm1vZGlmaWVyXHJcbiAgICAgIGNvbnNvbGUubG9nIG5vdGlmaWNhdGlvbi5tb2RpZmllclxyXG4gICAgICBjb25zb2xlLmxvZyBAcGF0aFxyXG4gICAgICBjb25zb2xlLmxvZyBAcGF0aFtub3RpZmljYXRpb24ubW9kaWZpZXJdXHJcbiAgICAgICRub3RpZmljYXRpb24uYWRkQ2xhc3MgJ25vdGlmaWNhdGlvbnNfX2l0ZW0tLScrbm90aWZpY2F0aW9uLm1vZGlmaWVyXHJcbiAgICAgICRpY29uID0gJzxzdmcgY2xhc3M9XCJpY29uIG5vdGlmaWNhdGlvbnNfX2l0ZW1fX2ljb25cIj48dXNlIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHhsaW5rOmhyZWY9XCInICsgQHBhdGhbbm90aWZpY2F0aW9uLm1vZGlmaWVyXSArICdcIj48L3VzZT48L3N2Zz4nXHJcbiAgICAgIGNvbnNvbGUubG9nICRpY29uXHJcblxyXG4gICAgJGljb25Db250YWluZXIgPSAkICc8ZGl2IGNsYXNzPVwibm90aWZpY2F0aW9uc19faXRlbV9faWNvbi1jb250YWluZXJcIj4nXHJcblxyXG4gICAgJGljb25Db250YWluZXIuYXBwZW5kICRpY29uXHJcbiAgICAkbm90aWZpY2F0aW9uLmFwcGVuZCAkaWNvbkNvbnRhaW5lclxyXG5cclxuICAgICRub3RpZmljYXRpb24ub24gJ2NsaWNrJywgLT5cclxuICAgICAgQGhpZGVOb3RpZmljYXRpb24gJG5vdGlmaWNhdGlvblxyXG5cclxuICAgICRjb250ZW50ID0gJCAnPGRpdiBjbGFzcz1cIm5vdGlmaWNhdGlvbnNfX2l0ZW1fX2NvbnRlbnRcIj48L2Rpdj4nXHJcbiAgICBpZiBub3RpZmljYXRpb24uaHRtbCA9PSB0cnVlXHJcbiAgICAgICRjb250ZW50Lmh0bWwgbm90aWZpY2F0aW9uLmNvbnRlbnRcclxuICAgIGVsc2VcclxuICAgICAgJGNvbnRlbnQudGV4dCBub3RpZmljYXRpb24uY29udGVudFxyXG5cclxuICAgICRub3RpZmljYXRpb24uYXBwZW5kICRjb250ZW50XHJcblxyXG4gICAgdGltZW91dCA9IDIwMDBcclxuXHJcbiAgICBpZiB0eXBlb2Ygbm90aWZpY2F0aW9uLnRpbWVvdXQgPT0gXCJudW1iZXJcIlxyXG4gICAgICB0aW1lb3V0ID0gbm90aWZpY2F0aW9uLnRpbWVvdXRcclxuXHJcbiAgICBzZXRUaW1lb3V0ICg9PlxyXG4gICAgICBAaGlkZU5vdGlmaWNhdGlvbiAkbm90aWZpY2F0aW9uXHJcbiAgICApLCB0aW1lb3V0XHJcblxyXG4gICAgQCRlbGVtZW50LmFwcGVuZCAkbm90aWZpY2F0aW9uXHJcblxyXG4gIGhpZGVOb3RpZmljYXRpb246ICgkbm90aWZpY2F0aW9uKSAtPlxyXG4gICAgJG5vdGlmaWNhdGlvbi5hZGRDbGFzcyAnbm90aWZpY2F0aW9uc19faXRlbS0tZmFkZS1vdXQnXHJcbiAgICBzZXRUaW1lb3V0ICgtPlxyXG4gICAgICAkbm90aWZpY2F0aW9uLnJlbW92ZSgpXHJcbiAgICApLCA1MDBcclxuXHJcbiMgUGx1Z2luIGRlZmluaXRpb25cclxuUGx1Z2luID0gKG9wdGlvbikgLT5cclxuICBwYXJhbXMgPSBhcmd1bWVudHNcclxuXHJcbiAgcmV0dXJuIHRoaXMuZWFjaCAoKSAtPlxyXG4gICAgJHRoaXMgPSAkKHRoaXMpXHJcbiAgICBkYXRhID0gJHRoaXMuZGF0YSgnYXhhLm5vdGlmaWNhdGlvbicpXHJcblxyXG4gICAgaWYgbm90IGRhdGFcclxuICAgICAgZGF0YSA9IG5ldyBOb3RpZmljYXRpb25QYW5lKHRoaXMpXHJcbiAgICAgICR0aGlzLmRhdGEoJ2F4YS5ub3RpZmljYXRpb24nLCBkYXRhKVxyXG5cclxuICAgIGlmIHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCdcclxuICAgICAgZGF0YS5kaXNwbGF5Tm90aWZpY2F0aW9uIG9wdGlvblxyXG5cclxuICAgIGlmIHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZydcclxuICAgICAgZGF0YS5kaXNwbGF5Tm90aWZpY2F0aW9uIHtcclxuICAgICAgICBjb250ZW50OiBvcHRpb25cclxuICAgICAgfVxyXG5cclxuIyBQbHVnaW4gcmVnaXN0cmF0aW9uXHJcbiQuZm4ubm90aWZpY2F0aW9uID0gUGx1Z2luXHJcbiQuZm4ubm90aWZpY2F0aW9uLkNvbnN0cnVjdG9yID0gTm90aWZpY2F0aW9uUGFuZVxyXG5cclxuIyBEQVRBLUFQSVxyXG4kKGRvY3VtZW50KS5vbiAnY2xpY2suYXhhLm5vdGlmaWNhdGlvbi5kYXRhLWFwaScsICdbZGF0YS1ub3RpZmljYXRpb25dJywgKGUpIC0+XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICR0aGlzID0gJCB0aGlzXHJcblxyXG4gICR0YXJnZXQgPSAkICR0aGlzLmRhdGEoJ25vdGlmaWNhdGlvbicpXHJcblxyXG4gIFBsdWdpbi5jYWxsICR0YXJnZXQsIHtcclxuICAgIGNvbnRlbnQ6ICR0aGlzLmRhdGEoJ25vdGlmaWNhdGlvbi1jb250ZW50JylcclxuICAgIG1vZGlmaWVyOiAkdGhpcy5kYXRhKCdub3RpZmljYXRpb24tbW9kaWZpZXInKVxyXG4gIH1cclxuXHJcbiMhIENvcHlyaWdodCBBWEEgVmVyc2ljaGVydW5nZW4gQUcgMjAxNVxyXG4iLCIkID0gcmVxdWlyZSAnanF1ZXJ5J1xyXG5cclxuIyBQdWJsaWMgY2xhc3MgZGVmaW5pdGlvblxyXG5jbGFzcyBQb3BvdmVyXHJcbiAgY29uc3RydWN0b3I6IChlbGVtZW50LCBvcHRpb25zKSAtPlxyXG4gICAgQGVsZW1lbnQgPSBlbGVtZW50XHJcbiAgICBAJGVsZW1lbnQgPSAkIGVsZW1lbnRcclxuICAgIEBvcHRpb25zID0gJC5leHRlbmQge30sIG9wdGlvbnNcclxuXHJcbiAgICBAJHRhcmdldCA9ICQgQCRlbGVtZW50LmRhdGEoJ3BvcG92ZXInKVxyXG4gICAgQCRjbG9zZUljb24gPSBAJHRhcmdldC5maW5kICcucG9wb3Zlcl9fY2xvc2UnXHJcblxyXG4gICAgQGlzT3BlbiA9IGZhbHNlXHJcblxyXG4gICAgQCRlbGVtZW50Lm9uICdjbGljaycsIEAsIEB0b2dnbGVcclxuICAgIEAkY2xvc2VJY29uLm9uICdjbGljaycsIEAsIEB0b2dnbGVcclxuXHJcbiAgICBAcG9zaXRpb24oKVxyXG5cclxuICAgICQod2luZG93KS5vbiAncmVzaXplJywgQHBvc2l0aW9uXHJcblxyXG4gIHRvZ2dsZTogKGV2ZW50KSAtPlxyXG4gICAgZXZlbnQuZGF0YS5pc09wZW4gPSBub3QgZXZlbnQuZGF0YS5pc09wZW5cclxuICAgIGV2ZW50LmRhdGEucG9zaXRpb24oKVxyXG4gICAgZXZlbnQuZGF0YS4kdGFyZ2V0LnRvZ2dsZUNsYXNzICdpcy1hY3RpdmUnXHJcblxyXG4gIHBvc2l0aW9uOiAoKSA9PlxyXG4gICAgJGJveCA9IEAkdGFyZ2V0LmZpbmQgJy5wb3BvdmVyX19ib3gnXHJcbiAgICAkdGFpbCA9IEAkdGFyZ2V0LmZpbmQgJy5wb3BvdmVyX190YWlsJ1xyXG5cclxuICAgICN0b2RvIHByb3BlciB3b3JrYXJvdW5kIGZvciBpZTlcclxuICAgIGlzU21hbGwgPSBmYWxzZVxyXG4gICAgaWYgd2luZG93Lm1hdGNoTWVkaWE/ICNub3Qgc3VwcG9ydGVkIGJ5IElFOVxyXG4gICAgICBpc1NtYWxsID0gbm90IHdpbmRvdy5tYXRjaE1lZGlhKCcobWluLXdpZHRoOiA3NjhweCknKS5tYXRjaGVzXHJcbiAgICBlbHNlICN0aGlzIG1ha2VzIGl0IGtpbmRhIHdvcmsgaW4gSUU5XHJcbiAgICAgIGlzU21hbGwgPSAkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgNzY4XHJcblxyXG4gICAgaWYgaXNTbWFsbFxyXG4gICAgICBpZiBAaXNPcGVuXHJcbiAgICAgICAgJCgnYm9keScpLmFkZENsYXNzICdpcy1tb2RhbC1vcGVuJ1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzICdpcy1tb2RhbC1vcGVuJ1xyXG5cclxuICAgICAgJGJveC5jc3MgeyB0b3A6IDAsIGxlZnQ6IDAgfVxyXG4gICAgZWxzZVxyXG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MgJ2lzLW1vZGFsLW9wZW4nXHJcbiAgICAgICNib3hcclxuICAgICAgbWF4T2Zmc2V0VG9wID0gJChkb2N1bWVudCkuaGVpZ2h0KCkgLSAkYm94Lm91dGVySGVpZ2h0KClcclxuICAgICAgbWF4T2Zmc2V0TGVmdCA9ICQoZG9jdW1lbnQpLndpZHRoKCkgLSAkYm94Lm91dGVyV2lkdGgoKSAtIDIwXHJcblxyXG4gICAgICBvZmZzZXQgPSB7IHRvcDogMCwgbGVmdDogMCB9XHJcbiAgICAgIG9mZnNldC50b3AgPSBAJGVsZW1lbnQub2Zmc2V0KCkudG9wICsgQCRlbGVtZW50Lm91dGVySGVpZ2h0KCkgKyAyMFxyXG4gICAgICBvZmZzZXQubGVmdCA9IEAkZWxlbWVudC5vZmZzZXQoKS5sZWZ0XHJcblxyXG4gICAgICBpZiBvZmZzZXQubGVmdCA+IG1heE9mZnNldExlZnRcclxuICAgICAgICBvZmZzZXQubGVmdCA9IG1heE9mZnNldExlZnRcclxuXHJcbiAgICAgICN0YWlsXHJcbiAgICAgICR0YWlsLnJlbW92ZUNsYXNzICdwb3BvdmVyX190YWlsLS10b3AgcG9wb3Zlcl9fdGFpbC0tYm90dG9tJ1xyXG4gICAgICB0YWlsT2Zmc2V0ID0geyB0b3A6IDAsIGxlZnQ6IDAgfVxyXG4gICAgICB0YWlsT2Zmc2V0LnRvcCA9IEAkZWxlbWVudC5vZmZzZXQoKS50b3AgKyBAJGVsZW1lbnQub3V0ZXJIZWlnaHQoKSAtIDIwXHJcbiAgICAgIHRhaWxPZmZzZXQubGVmdCA9IEAkZWxlbWVudC5vZmZzZXQoKS5sZWZ0ICsgQCRlbGVtZW50Lm91dGVyV2lkdGgoKSAvIDIgLSAyMFxyXG4gICAgICB0YWlsQ2xhc3MgPSAncG9wb3Zlcl9fdGFpbC0tdG9wJ1xyXG5cclxuICAgICAgI3Bvc2l0aW9uIGFib3ZlIGlmIG5vdCBlbm91Z2ggc3BhY2UgYmVsb3dcclxuICAgICAgaWYgb2Zmc2V0LnRvcCA+IG1heE9mZnNldFRvcFxyXG4gICAgICAgIG9mZnNldC50b3AgPSBAJGVsZW1lbnQub2Zmc2V0KCkudG9wIC0gJGJveC5vdXRlckhlaWdodCgpIC0gMjBcclxuICAgICAgICB0YWlsT2Zmc2V0LnRvcCA9IEAkZWxlbWVudC5vZmZzZXQoKS50b3AgLSAyMFxyXG4gICAgICAgIHRhaWxDbGFzcyA9ICdwb3BvdmVyX190YWlsLS1ib3R0b20nXHJcblxyXG4gICAgICAkYm94Lm9mZnNldCBvZmZzZXRcclxuICAgICAgJHRhaWwuYWRkQ2xhc3MgdGFpbENsYXNzXHJcbiAgICAgICR0YWlsLm9mZnNldCB0YWlsT2Zmc2V0XHJcblxyXG4jIFBsdWdpbiBkZWZpbml0aW9uXHJcblBsdWdpbiA9IChvcHRpb24pIC0+XHJcbiAgcGFyYW1zID0gYXJndW1lbnRzXHJcblxyXG4gIHJldHVybiB0aGlzLmVhY2ggKCkgLT5cclxuICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGF0YSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXHJcbiAgICAkdGhpcyA9ICQgdGhpc1xyXG4gICAgZGF0YSA9ICR0aGlzLmRhdGEoJ2F4YS5wb3BvdmVyJylcclxuXHJcbiAgICBpZiBub3QgZGF0YVxyXG4gICAgICBkYXRhID0gbmV3IFBvcG92ZXIgdGhpcywgb3B0aW9uc1xyXG4gICAgICAkdGhpcy5kYXRhICdheGEucG9wb3ZlcicsIGRhdGFcclxuXHJcbiMgUGx1Z2luIHJlZ2lzdHJhdGlvblxyXG4kLmZuLnBvcG92ZXIgPSBQbHVnaW5cclxuJC5mbi5wb3BvdmVyLkNvbnN0cnVjdG9yID0gUG9wb3ZlclxyXG5cclxuIyBEQVRBLUFQSVxyXG4kKHdpbmRvdykub24gJ2xvYWQnLCAoKSAtPlxyXG4gICQoJ1tkYXRhLXBvcG92ZXJdJykuZWFjaCAoKSAtPlxyXG4gICAgJHBvcG92ZXIgPSAkKHRoaXMpXHJcblxyXG4gICAgUGx1Z2luLmNhbGwoJHBvcG92ZXIpXHJcblxyXG4jISBDb3B5cmlnaHQgQVhBIFZlcnNpY2hlcnVuZ2VuIEFHIDIwMTVcclxuIiwiJCA9IHJlcXVpcmUgJ2pxdWVyeSdcclxuXHJcbiMgUHVibGljIGNsYXNzIGRlZmluaXRpb25cclxuY2xhc3MgU2VnbWVudGVkQ29udHJvbFxyXG4gIEBERUZBVUxUU1xyXG5cclxuICBjb25zdHJ1Y3RvcjogKGVsZW1lbnQsIG9wdGlvbnMpIC0+XHJcbiAgICBAJGVsZW1lbnQgPSAkIGVsZW1lbnRcclxuICAgIGRpc2FibGVkID0gQCRlbGVtZW50LmlzKCdbZGlzYWJsZWQ9ZGlzYWJsZWRdJylcclxuXHJcbiAgICAjIFRPRE86IERvIG5vdCBkZXBlbmQgb24gY3NzIGNsYXNzZXNcclxuICAgIEAkcmFkaW9zID0gQCRlbGVtZW50LmZpbmQgJy5zZWdtZW50ZWQtY29udHJvbF9faXRlbV9fcmFkaW8nXHJcblxyXG4gICAgQCRyYWRpb3MuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XHJcbiAgICAgICRyYWRpbyA9ICQgZWxlbWVudFxyXG4gICAgICAkcmFkaW8ucHJvcCgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKSBpZiBkaXNhYmxlZFxyXG4gICAgICAkcmFkaW8uZGF0YSAnaXRlbS5lbGVtZW50JywgJHJhZGlvLmNsb3Nlc3QgJy5zZWdtZW50ZWQtY29udHJvbF9faXRlbSdcclxuXHJcbiAgICBAb3B0aW9ucyA9ICQuZXh0ZW5kIHt9LCBTZWdtZW50ZWRDb250cm9sLkRFRkFVTFRTLCBvcHRpb25zXHJcblxyXG4gICAgQGluaXQoKVxyXG5cclxuICBpbml0OiAoKSAtPlxyXG4gICAgQCRyYWRpb3MucHJvcCAndGFiaW5kZXgnLCAnLTEnXHJcbiAgICBAJGVsZW1lbnQucHJvcCAndGFiaW5kZXgnLCAnMCdcclxuXHJcbiAgICBAJGVsZW1lbnQuYWRkQ2xhc3MgJ3NlZ21lbnRlZC1jb250cm9sLS1qcydcclxuXHJcbiAgICBAc2V0UmFkaW9TdGF0ZSgpXHJcblxyXG4gICAgQCRyYWRpb3Mub24gJ2NoYW5nZScsIEBzZXRSYWRpb1N0YXRlXHJcblxyXG4gICAgQCRlbGVtZW50Lm9uICdrZXl1cCcsIEBoYW5kbGVLZXlVcFxyXG5cclxuICAgIEAkZWxlbWVudC5vbiAna2V5ZG93bicsIEBoYW5kbGVLZXlEb3duXHJcblxyXG4gICAgQHN0YWNrQ29udHJvbHNJZk5lZWRlZCgpXHJcblxyXG4gICAgJCgnd2luZG93Jykub24gJ3Jlc2l6ZScsIEBzdGFja0NvbnRyb2xzSWZOZWVkZWRcclxuXHJcbiAgc3RhY2tDb250cm9sc0lmTmVlZGVkOiAoKSAtPlxyXG4gICAgQCRlbGVtZW50LnJlbW92ZUNsYXNzICdzZWdtZW50ZWQtY29udHJvbC0tc3RhY2tlZCdcclxuXHJcbiAgICBpZiBAJGVsZW1lbnQub3V0ZXJXaWR0aCgpID49IEAkZWxlbWVudC5wYXJlbnQoKS5pbm5lcldpZHRoKClcclxuICAgICAgQCRlbGVtZW50LmFkZENsYXNzICdzZWdtZW50ZWQtY29udHJvbC0tc3RhY2tlZCdcclxuXHJcbiAgIyBTcGFjZXdhciB3aWxsIGFjdGl2YXRlIGZpcnN0IGl0ZW0gaWYgbm9uZSBpcyBhY3RpdmVcclxuICBoYW5kbGVLZXlVcDogKGUpID0+XHJcbiAgICBpZiBlLndoaWNoID09IDMyXHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICBpZiBAJHJhZGlvcy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoID09IDBcclxuICAgICAgICAkZmlyc3QgPSAkIEAkcmFkaW9zWzBdXHJcbiAgICAgICAgJGZpcnN0LnByb3AgJ2NoZWNrZWQnLCB0cnVlXHJcbiAgICAgICAgJGZpcnN0LmNoYW5nZSgpXHJcblxyXG4gICMgQXJyb3dzIHdpbGwgYWN0aXZhdGUgdGhlIG5leHQvcHJldmlvdXMgcmFkaW9cclxuICBoYW5kbGVLZXlEb3duOiAoZSkgPT5cclxuICAgIHN3aXRjaCBlLndoaWNoXHJcbiAgICAgICMgcHJldmVudCBzY3JvbGxpbmdcclxuICAgICAgd2hlbiAzMlxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAjIGxlZnQgLyB1cFxyXG4gICAgICB3aGVuIDM3LCAzOFxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG5cclxuICAgICAgICAkY2hlY2tlZCA9ICQgQCRyYWRpb3MuZmlsdGVyKCc6Y2hlY2tlZCcpXHJcblxyXG4gICAgICAgIGlmICRjaGVja2VkLmxlbmd0aCAhPSAwXHJcbiAgICAgICAgICAkcHJldmlvdXMgPSAkIEAkcmFkaW9zW0AkcmFkaW9zLmluZGV4KCRjaGVja2VkKSAtIDFdXHJcblxyXG4gICAgICAgICAgaWYgJHByZXZpb3VzPyAmJiAkcHJldmlvdXMubGVuZ3RoICE9IDBcclxuICAgICAgICAgICAgJHByZXZpb3VzLnByb3AgJ2NoZWNrZWQnLCB0cnVlXHJcbiAgICAgICAgICAgICRwcmV2aW91cy5jaGFuZ2UoKVxyXG5cclxuICAgICAgIyByaWdodCAvIGRvd25cclxuICAgICAgd2hlbiAzOSwgNDBcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICAgICAgJGNoZWNrZWQgPSAkIEAkcmFkaW9zLmZpbHRlcignOmNoZWNrZWQnKVxyXG5cclxuICAgICAgICAjIGNoZWNrIHNlY29uZCByYWRpbyB3aGVuIG5vbmUgaXMgY2hlY2tlZFxyXG4gICAgICAgIGlmICRjaGVja2VkLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICAkZmlyc3QgPSAkIEAkcmFkaW9zWzFdXHJcblxyXG4gICAgICAgICAgaWYgJGZpcnN0PyAmICRmaXJzdC5sZW5ndGggIT0gMFxyXG4gICAgICAgICAgICAkZmlyc3QucHJvcCAnY2hlY2tlZCcsIHRydWVcclxuICAgICAgICAgICAgJGZpcnN0LmNoYW5nZSgpXHJcblxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICRuZXh0ID0gJCBAJHJhZGlvc1tAJHJhZGlvcy5pbmRleCgkY2hlY2tlZCkgKyAxXVxyXG5cclxuICAgICAgICAgIGlmICRuZXh0PyAmJiAkbmV4dC5sZW5ndGggIT0gMFxyXG4gICAgICAgICAgICAkbmV4dC5wcm9wICdjaGVja2VkJywgdHJ1ZVxyXG4gICAgICAgICAgICAkbmV4dC5jaGFuZ2UoKVxyXG5cclxuXHJcbiAgc2V0UmFkaW9TdGF0ZTogKCkgPT5cclxuXHJcbiAgICBAJHJhZGlvcy5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cclxuXHJcbiAgICAgICRyYWRpbyA9ICQgZWxlbWVudFxyXG4gICAgICAkaXRlbSA9ICRyYWRpby5kYXRhICdpdGVtLmVsZW1lbnQnXHJcblxyXG4gICAgICBpZiAkcmFkaW8uaXMgJzpjaGVja2VkJ1xyXG4gICAgICAgICRpdGVtLmFkZENsYXNzICdpcy1hY3RpdmUnXHJcbiAgICAgIGVsc2VcclxuICAgICAgICAkaXRlbS5yZW1vdmVDbGFzcyAnaXMtYWN0aXZlJ1xyXG5cclxuIyBQbHVnaW4gZGVmaW5pdGlvblxyXG5QbHVnaW4gPSAob3B0aW9uKSAtPlxyXG4gIHBhcmFtcyA9IGFyZ3VtZW50c1xyXG5cclxuICByZXR1cm4gdGhpcy5lYWNoICgpIC0+XHJcbiAgICAkdGhpcyA9ICQgdGhpc1xyXG4gICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBTZWdtZW50ZWRDb250cm9sLkRFRkFVTFRTLCBkYXRhLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcclxuICAgIGRhdGEgPSAkdGhpcy5kYXRhKCdheGEuc2VnbWVudGVkQ29udHJvbCcpXHJcblxyXG4gICAgaWYgbm90IGRhdGFcclxuICAgICAgZGF0YSA9IG5ldyBTZWdtZW50ZWRDb250cm9sIHRoaXMsIG9wdGlvbnNcclxuICAgICAgJHRoaXMuZGF0YSAnYXhhLnNlZ21lbnRlZENvbnRyb2wnLCBkYXRhXHJcblxyXG4jIFBsdWdpbiByZWdpc3RyYXRpb25cclxuJC5mbi5zZWdtZW50ZWRDb250cm9sID0gUGx1Z2luXHJcbiQuZm4uc2VnbWVudGVkQ29udHJvbC5Db25zdHJ1Y3RvciA9IFNlZ21lbnRlZENvbnRyb2xcclxuXHJcbiMgREFUQS1BUElcclxuJCh3aW5kb3cpLm9uICdsb2FkJywgKCkgLT5cclxuICAkKCdbZGF0YS1zZWdtZW50ZWQtY29udHJvbF0nKS5lYWNoICgpIC0+XHJcbiAgICAkc2VnbWVudGVkQ29udHJvbCA9ICQodGhpcylcclxuICAgIGRhdGEgPSAkc2VnbWVudGVkQ29udHJvbC5kYXRhKClcclxuXHJcbiAgICBQbHVnaW4uY2FsbCgkc2VnbWVudGVkQ29udHJvbCwgZGF0YSlcclxuXHJcbiMhIENvcHlyaWdodCBBWEEgVmVyc2ljaGVydW5nZW4gQUcgMjAxNVxyXG4iLCJpbXBvcnQgJCBmcm9tICdqcXVlcnknXHJcblxyXG5jbGFzcyBTaXRlIHtcclxuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy4kcGFnZSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtcGFnZV0nKVxyXG4gICAgdGhpcy4kbWFzayA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtbWFza10nKVxyXG4gICAgdGhpcy4kbW9iaWxlID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1tb2JpbGVdJylcclxuICAgIHRoaXMuJGJ1cmdlciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtYnVyZ2VyXScpXHJcbiAgICB0aGlzLmluaXQoKVxyXG4gIH1cclxuXHJcbiAgaW5pdCgpIHtcclxuICAgIHRoaXMuJG1hc2sub24oJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgICAgdGhpcy5oaWRlTWVudSgpXHJcbiAgICB9KVxyXG5cclxuICAgIHRoaXMuJGJ1cmdlci5vbignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgICB0aGlzLnRvZ2dsZU1lbnUoKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHRvZ2dsZU1lbnUoc2hvdykge1xyXG4gICAgaWYgKHNob3cgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBzaG93ID0gIXRoaXMuJHBhZ2UuaGFzQ2xhc3MoJ2lzLXB1c2hlZCcpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC50b2dnbGVDbGFzcygnaXMtbW9iaWxlLW5hdi1vcGVuJywgc2hvdylcclxuICAgIHRoaXMuJHBhZ2UudG9nZ2xlQ2xhc3MoJ2lzLXB1c2hlZCcsIHNob3cpXHJcbiAgICB0aGlzLiRtYXNrLnRvZ2dsZUNsYXNzKCdpcy12aXNpYmxlJywgc2hvdylcclxuICAgIHRoaXMuJG1vYmlsZS50b2dnbGVDbGFzcygnaXMtdmlzaWJsZScsIHNob3cpXHJcbiAgICB0aGlzLiRidXJnZXIuZWFjaCgoaSwgZWxlbWVudCkgPT4geyBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2lzLW9wZW4nLCBzaG93KSB9KVxyXG4gIH1cclxuXHJcbiAgc2hvd01lbnUoKSB7XHJcbiAgICB0aGlzLnRvZ2dsZU1lbnUodHJ1ZSlcclxuICB9XHJcblxyXG4gIGhpZGVNZW51KCkge1xyXG4gICAgdGhpcy50b2dnbGVNZW51KGZhbHNlKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gUGx1Z2luKCkge1xyXG4gIGxldCBwYXJhbXMgPSBhcmd1bWVudHNcclxuXHJcbiAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICBsZXQgJHRoaXMgPSAkKHRoaXMpXHJcbiAgICBsZXQgZGF0YSA9ICR0aGlzLmRhdGEoJ2F4YS5zaXRlJylcclxuXHJcbiAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgZGF0YSA9IG5ldyBTaXRlKHRoaXMpXHJcbiAgICAgICR0aGlzLmRhdGEoJ2F4YS5zaXRlJywgZGF0YSlcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbWV0aG9kID0gcGFyYW1zWzBdXHJcbiAgICBpZiAodHlwZW9mKG1ldGhvZCkgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIGRhdGFbbWV0aG9kXSguLi5wYXJhbXMuc2xpY2UoMSkpXHJcbiAgICB9XHJcbiAgfSlcclxufVxyXG5cclxuJC5mbi5zaXRlID0gUGx1Z2luXHJcbiQuZm4uc2l0ZS5Db25zdHJ1Y3RvciA9IFNpdGVcclxuXHJcbiQoZnVuY3Rpb24gKCkge1xyXG4gICQoJ1tkYXRhLXNpdGVdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICBsZXQgJHNpdGUgPSAkKHRoaXMpXHJcbiAgICBQbHVnaW4uY2FsbCgkc2l0ZSlcclxuICB9KVxyXG59KVxyXG5cclxuLy8gQ29weXJpZ2h0IEFYQSBWZXJzaWNoZXJ1bmdlbiBBRyAyMDE1XHJcbiIsIiFmdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW10sZnVuY3Rpb24oKXtyZXR1cm4gYS5zdmc0ZXZlcnlib2R5PWIoKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWIoKTphLnN2ZzRldmVyeWJvZHk9YigpfSh0aGlzLGZ1bmN0aW9uKCl7LyohIHN2ZzRldmVyeWJvZHkgdjIuMC4wIHwgZ2l0aHViLmNvbS9qb25hdGhhbnRuZWFsL3N2ZzRldmVyeWJvZHkgKi9cclxuZnVuY3Rpb24gYShhLGIpe2lmKGIpe3ZhciBjPSFhLmdldEF0dHJpYnV0ZShcInZpZXdCb3hcIikmJmIuZ2V0QXR0cmlidXRlKFwidmlld0JveFwiKSxkPWRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxlPWIuY2xvbmVOb2RlKCEwKTtmb3IoYyYmYS5zZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIsYyk7ZS5jaGlsZE5vZGVzLmxlbmd0aDspZC5hcHBlbmRDaGlsZChlLmZpcnN0Q2hpbGQpO2EuYXBwZW5kQ2hpbGQoZCl9fWZ1bmN0aW9uIGIoYil7Yi5vbnJlYWR5c3RhdGVjaGFuZ2U9ZnVuY3Rpb24oKXtpZig0PT09Yi5yZWFkeVN0YXRlKXt2YXIgYz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwieFwiKTtjLmlubmVySFRNTD1iLnJlc3BvbnNlVGV4dCxiLnMuc3BsaWNlKDApLm1hcChmdW5jdGlvbihiKXthKGJbMF0sYy5xdWVyeVNlbGVjdG9yKFwiI1wiK2JbMV0ucmVwbGFjZSgvKFxcVykvZyxcIlxcXFwkMVwiKSkpfSl9fSxiLm9ucmVhZHlzdGF0ZWNoYW5nZSgpfWZ1bmN0aW9uIGMoYyl7ZnVuY3Rpb24gZCgpe2Zvcih2YXIgYyxsLG09MDttPGYubGVuZ3RoOylpZihjPWZbbV0sbD1jLnBhcmVudE5vZGUsbCYmL3N2Zy9pLnRlc3QobC5ub2RlTmFtZSkpe3ZhciBuPWMuZ2V0QXR0cmlidXRlKFwieGxpbms6aHJlZlwiKTtpZihlKXt2YXIgbz1uZXcgSW1hZ2UscD1sLmdldEF0dHJpYnV0ZShcIndpZHRoXCIpLHE9bC5nZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIik7by5zcmM9ZyhuLGwsYykscCYmby5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLHApLHEmJm8uc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIscSksbC5yZXBsYWNlQ2hpbGQobyxjKX1lbHNlIGlmKGgmJighaXx8aShuLGwsYykpKXt2YXIgcj1uLnNwbGl0KFwiI1wiKSxzPXJbMF0sdD1yWzFdO2lmKGwucmVtb3ZlQ2hpbGQoYykscy5sZW5ndGgpe3ZhciB1PWtbc109a1tzXXx8bmV3IFhNTEh0dHBSZXF1ZXN0O3Uuc3x8KHUucz1bXSx1Lm9wZW4oXCJHRVRcIixzKSx1LnNlbmQoKSksdS5zLnB1c2goW2wsdF0pLGIodSl9ZWxzZSBhKGwsZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodCkpfX1lbHNlIG0rPTE7aihkLDE3KX1jPWN8fHt9O3ZhciBlLGY9ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ1c2VcIiksZz1jLmZhbGxiYWNrfHxmdW5jdGlvbihhKXtyZXR1cm4gYS5yZXBsYWNlKC9cXD9bXiNdKy8sXCJcIikucmVwbGFjZShcIiNcIixcIi5cIikucmVwbGFjZSgvXlxcLi8sXCJcIikrXCIucG5nXCIrKC9cXD9bXiNdKy8uZXhlYyhhKXx8W1wiXCJdKVswXX07ZT1cIm5vc3ZnXCJpbiBjP2Mubm9zdmc6L1xcYk1TSUUgWzEtOF1cXGIvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksZSYmKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdmdcIiksZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInVzZVwiKSk7dmFyIGg9XCJwb2x5ZmlsbFwiaW4gYz9jLnBvbHlmaWxsOmV8fC9cXGJFZGdlXFwvMTJcXGJ8XFxiTVNJRSBbMS04XVxcYnxcXGJUcmlkZW50XFwvWzU2N11cXGJ8XFxiVmVyc2lvblxcLzcuMCBTYWZhcmlcXGIvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCl8fChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9BcHBsZVdlYktpdFxcLyhcXGQrKS8pfHxbXSlbMV08NTM3LGk9Yy52YWxpZGF0ZSxqPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHNldFRpbWVvdXQsaz17fTtoJiZkKCl9cmV0dXJuIGN9KTsiXX0=
