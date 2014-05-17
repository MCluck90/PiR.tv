$(document).ready(function() {
    // Show/hide the loading image
    var Loader = {
        _$el: $('#loader'),
        show: function() {
            this._$el.siblings('div').hide();
            this._$el.show();
        },
        hide: function() {
            this._$el.siblings('div').show();
            this._$el.hide();
        }
    };

    // Show a clock
    var Clock = {
        _$time: $('#time'),
        _$date: $('#date'),
        _weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        _months: [
            'January',   'February', 'March',    'April',
            'May',       'June',     'July',     'August',
            'September', 'October',  'November', 'December'
        ],

        /**
         * Gets the time in parts
         * @returns {{day: *, date: number, month: *, hour: *, minute: *, second: *}}
         */
        getTimeParts: function() {
            var self = this,
                date = new Date(),
                hour = date.getHours();

            return {
                day:    self._weekdays[date.getDay()],
                date:   date.getDate(),
                month:  self._months[date.getMonth()],
                hour:   self.appendZero(hour),
                minute: self.appendZero(date.getMinutes()),
                second: self.appendZero(date.getSeconds())
            };
        },

        /**
         * Appends a 0 to the beginning of any numbers less than 10
         * @param num
         * @returns {string}
         */
        appendZero: function(num) {
            if (num < 10) {
                return '0' + num;
            } else {
                return num;
            }
        },

        /**
         * Refreshes the clock
         */
        refresh: function() {
            var parts = this.getTimeParts();
            this._$date.html(parts.day + ', ' + parts.month + ' ' + parts.date);
            this._$time.html(
                '<span class="hour">' + parts.hour + '</span> : ' +
                '<span class="minute">' + parts.minute + '</span> : ' +
                '<span class="second">' + parts.second + '</span>'
            );
        },

        /**
         * Get the clock running
         */
        start: function() {
            if (Clock._running) {
                return;
            }

            setTimeout(function refreshClock() {
                Clock.refresh();
                setTimeout(refreshClock, 1000);
            }, 1000);
            Clock.refresh();
        }
    };

    // Initialize the site
    Clock.start();
    $('.logo').html($('#rpi-svg').html());
});