(function(window, document) {
    var Soundboard = {};

    Soundboard.playSound = function(event) {
        var element = event.target;
        var file = element.value;
        
        this.getFile(file);
    };

    Soundboard.onDecoded = function(buffer) {
        var bufferSource = this.context.createBufferSource();
        this.reverseChannels(buffer, this.backwards);
        bufferSource.buffer = buffer;
        bufferSource.connect(this.context.destination);
        bufferSource.playbackRate.value = this.speed;
        bufferSource.start();
    };

    Soundboard.getFile = function(file) {
        this.request.open('GET', file, true);
        this.request.responseType = 'arraybuffer';
        this.request.onload = function() {
            this.context.decodeAudioData(this.request.response, this.onDecoded.bind(this));
        }.bind(this);
        this.request.send();
    };

    Soundboard.reverseChannels = function(buffer, backwards) {
        if(!backwards) {
            return buffer;
        }
        for(let i = 0; i < buffer.numberOfChannels; i++) {
            Array.prototype.reverse.call(buffer.getChannelData(i));
        }
        return buffer;
    };

    Soundboard.init = function() {
        this.context = new AudioContext() || new WebkitAudioContext();
        this.request = new XMLHttpRequest();
        this.speed = 1;
        this.backwards = false;

        this.closeToggleElements();
        this.bindHandlers();
    };

    Soundboard.closeToggleElements = function() {
        var toggleElements = Array.prototype.slice.call(document.querySelectorAll('.toggle'));
        toggleElements.forEach(element => {
            element.classList.add('is-closed');
        });
    };

    Soundboard.bindHandlers = function() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('button'));
        buttons.forEach(element => {
            element.addEventListener('click', event => this.playSound(event));
        });

        var playSpeed = Array.prototype.slice.call(document.querySelectorAll('[data-play-speed]'));
        playSpeed.forEach(element => {
            element.addEventListener('change', event => this.updatePlaySpeed(event));
        });

        var playBackwards = document.querySelector('[data-play-backwards]');
        playBackwards.addEventListener('change', event => this.updatePlayDirection(event));

        var toggle = Array.prototype.slice.call(document.querySelectorAll('.toggle h2'));
        toggle.forEach(element => {
            element.addEventListener('click', event => this.handleToggleClick(event))
        });
    };

    Soundboard.handleToggleClick = function(event) {
        var element = event.currentTarget;
        var parent = element.closest('.toggle');
        if(parent.classList.contains('is-closed')) {
            return parent.classList.remove('is-closed');

        }
        parent.classList.add('is-closed');
    };

    Soundboard.updatePlaySpeed = function(event) {
        var element = event.target;
        this.speed = element.value;
    };

    Soundboard.updatePlayDirection = function(event) {
        var element = event.target;
        this.backwards = element.checked;
    };

    Soundboard.init();
})(window, document);