$(document).ready(function() {
    var $weatherList = $('ul.weather'),
        templateHTML = $('#weatherTpl').html();

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

    // Show the current weather
    var Weather = {
        /**
         * Initialize the weather
         */
        init: function() {
            Loader.show();
            var self = this,
                key = 'c9d417b22edc92cf',
                url = 'http://api.wunderground.com/api/' + key +
                      '/forecast10day/q/US/Orem.json';
            $.ajax({
                url: url,
                type: 'GET',
                data: {
                    callback: '?'
                },
                success: function(data) {
                    Loader.hide();

                    var forecast = data.forecast.simpleforecast.forecastday;
                    for (var i = 0, len = forecast.length; i < len && i < 7; i++) {
                        var item = forecast[i],
                            html = Mustache.to_html(templateHTML, {
                                day: item.date.weekday,
                                low: item.low.fahrenheit,
                                high: item.high.fahrenheit,
                                icon: self.getConditionIcon(item.icon_url)
                            });
                        $weatherList.append(html);
                    }
                },
                error: function(err) {
                    Loader.hide();
                    console.log('Failed to load weather data');
                    console.log(err);
                }
            });
        },

        /**
         * Returns the proper condition icon code
         * @param url
         * @returns {string}
         */
        getConditionIcon: function(url) {
            var pattern = /\/(\w+).gif$/,
                code = pattern.exec(url);

            if (code) {
                code = code[1];
            } else {
                // Can find the code
                return 'T';
            }

            switch(code) {
                // Day
                case "chanceflurries":
                case "chancesnow":
                    return "p";

                case "/ig/images/weather/flurries.gif":
                    return "]";

                case "chancesleet":
                    return "4";

                case "chancerain":
                    return "7";

                case "chancetstorms":
                    return "x";

                case "tstorms":
                case "nt_tstorms":
                    return "z";

                case "clear":
                case "sunny":
                    return "v";

                case "cloudy":
                    return "`";

                case "flurries":
                case "nt_flurries":
                    return "]";

                case "fog":
                case "hazy":
                case "nt_fog":
                case "nt_hazy":
                    return "g";

                case "mostlycloudy":
                case "partlysunny":
                case "partlycloudy":
                case "mostlysunny":
                    return "1";

                case "sleet":
                case "nt_sleet":
                    return "3";

                case "rain":
                case "nt_rain":
                    return "6";

                case "snow":
                case "nt_snow":
                    return "o";

                // Night
                case "nt_chanceflurries":
                    return "a";

                case "nt_chancerain":
                    return "8";

                case "nt_chancesleet":
                    return "5";

                case "nt_chancesnow":
                    return "[";

                case "nt_chancetstorms":
                    return "c";

                case "nt_clear":
                case "nt_sunny":
                    return "/";

                case "nt_cloudy":
                    return "2";

                case "nt_mostlycloudy":
                case "nt_partlysunny":
                case "nt_partlycloudy":
                case "nt_mostlysunny":
                    return "2";


                default:
                    console.log("MISSING", code);
                    return "T";
            }
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
    Weather.init();
    Clock.start();
    $('.logo').html($('#rpi-svg').html());
});