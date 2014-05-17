(function() {
    var host = document.location.origin,
        socket = io.connect(host),

        $startBlock = $('#start-block'),
        $endBlock = $('#end-block');

    // Tell the server we're ready
    socket.on('connect', function() {
        socket.emit('screen');
    });

    // Deal with controls from the remote
    socket.on('controlling', function(data) {
        var $selected = $('.selected'),
            $next = $selected.next(),
            $prev = $selected.prev();

        $selected.removeClass('selected');
        switch(data.action) {
            case 'goLeft':
                if ($prev.attr('id') === 'start-block') {
                    $endBlock.prev().addClass('selected');
                } else {
                    $prev.addClass('selected');
                }
                break;

            case 'goRight':
                if ($next.attr('id') === 'end-block') {
                    $startBlock.next().addClass('selected');
                } else {
                    $next.addClass('selected');
                }
                break;

            case 'enter':
                // TODO: Enter different media modes
                break;
        }
    });
})();