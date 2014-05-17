(function() {
    // Elements/HTML
    var $videoList = $('ul.video'),
        $container = $$('.r-container'),
        $appBody = $('.app-body'),
        templateHTML = $('#videoTpl').html();

    var host = document.location.origin,
        socket = io.connect(host),

        /**
         * Retrieves the search results for videos
         * @param {string} query
         */
        getSearchResults = function(query) {
            query = encodeURIComponent(query);
            var MAX_VIDEOS = 12;

            $.ajax({
                url: 'http://gdata.youtube.com/feeds/api/videos',
                type: 'GET',
                data: {
                    vq: query,
                    'max-results': MAX_VIDEOS,
                    alt: 'json-in-script',
                    callback: '?'
                },
                success: function(data) {
                    // Clear the previous search results
                    $videoList.html('');
                    var items = data.feed.entry;
                    for (var i = 0, len = items.length; i < len; i++) {
                        // Parse out the title, thumbnail, duration, and id from the feed
                        var item = items[i],
                            id = item.id.$t.split('/')[6],
                            title = item.title.$t,
                            thumbnail = item.media$group.media$thumbnail[0].url,
                            totalSeconds = item.media$group.yt$duration.seconds,
                            hours = parseInt(totalSeconds / 3600) % 24,
                            minutes = parseInt(totalSeconds / 60) % 60,
                            seconds = totalSeconds % 60,
                            duration = (hours < 10 ? '0' + hours : hours) + ':' +
                                       (minutes < 10 ? '0' + minutes : minutes) + ':' +
                                       (seconds < 10 ? '0' + seconds : seconds),
                            template = Mustache.to_html(templateHTML, {
                                id: id,
                                title: title,
                                thumbnail: thumbnail,
                                duration: duration
                            });

                        // Create the list of search results
                        $videoList.append(template);
                    }

                    // Prepare links to watch videos
                    $('.watch').click(function() {
                        socket.emit('video', {
                            action: 'player',
                            video_id: $(this).data('id')
                        });
                    });
                },
                error: function() {
                    alert('Failed to load search results');
                }
            });
        };

    // Let the server know we're here
    socket.on('connect', function() {
        socket.emit('remote');

        // Swipe the main screen to the left
        $container.swipeLeft(function() {
            socket.emit('control', {
                action: 'swipeLeft'
            });
        });

        // Swipe the main screen to the right
        $container.swipeRight(function() {
            socket.emit('control', {
                action: 'swipeRight'
            });
        });

        // Exit the current video
        $$('.r-header').tap(function() {
            socket.emit('control', {
                action: 'tap'
            });

            $appBody.fadeToggle('fast');
            $.get(host + '/omx/quit', function(data) {
                console.log(data);
            });
        });

        // Pause the video
        $appBody.tap(function() {
            $.get(host + '/omx/pause', function(data) {
                console.log(data);
            });
        });

        // Search for videos
        $('.search input').change(function() {
            getSearchResults($(this).val());
        });
    });

    // Alert the user that the video is loading
    socket.on('loading', function(data) {
        alert('Loading...');
        console.log(data);
    });
})();