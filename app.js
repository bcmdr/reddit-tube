// Video Control
const video = {
    playerLoaded: false,
    player: {},
    sources: [],
    current: 0,
    get currentId() {
        return this.sources[this.current].id;
    },
    prev() {
        this.jump(-1);
    },
    next() {
        this.jump(1);
    },
    jump(amount) {
        this.current = (this.current + amount) % this.sources.length;
        if (this.current < 0) {
            this.current = this.sources.length - 1;
        }
        this.play();
    },
    play() {
        let source = this.sources[this.current];
        this.player.loadVideoById(source.id);
    }
}

function parseYoutubeUrl (url) {
    // source: https://stackoverflow.com/questions/2499567/how-to-make-a-json-call-to-a-url/2499647#2499647
    var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[1].length == 11) ? match[1] : false;
}

function loadVideosAndPlayer(redditUrl) {

    fetch(redditUrl).then(response => { return response.json() }).then(data => {

        // Reset video storage
        video.sources = [];
        video.current = 0;

        // Get Video Ids from Reddit
        let posts = data.data.children;
        posts.forEach(data => {
            let post = data.data;
            let id = parseYoutubeUrl(post.url);
            if (id) {
                video.sources.push({id});
            }
        })

        // Then Prepare Video Player
        if (!video.playerLoaded) {
            preparePlayer()
        } else {
            video.play()
        }
    })
}

function preparePlayer() {
    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
    const onPlayerStateChange = function (event) {
        if (event.data === 0) {
            video.next()
        }
    }
    video.player = new YT.Player('player', {
        videoId: video.currentId,
        events: {
            'onStateChange': onPlayerStateChange
        }
    })
    video.playerLoaded = true;
}

function playSubredditVideos() {
    let subreddit = document.getElementById('subreddit-input').value
    let url = 'https://www.reddit.com/r/' + subreddit + '.json'
    loadVideosAndPlayer(url)
}

function prepareSubredditForm() {
    const handleSubmit = function () {
        event.preventDefault();
        playSubredditVideos();
    }
    const form = document.getElementById('subreddit-selector');
    form.addEventListener('submit', handleSubmit);
}

function main() {
    prepareSubredditForm();
    playSubredditVideos();
}

main() // run this function on page load






