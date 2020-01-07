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
        this.current = (this.current + amount) % this.sources.length; // wrap to beginning
        if (this.current < 0) {
            this.current = this.sources.length - 1;
        }
        this.play();
    },
    updateDescription() {
        let source = this.sources[this.current];
        document.getElementById("video-heading").textContent = source.description;
        document.getElementById("video-reddit-link").href = "https://www.reddit.com" + source.permalink;
    },
    play() {
        let source = this.sources[this.current];
        this.updateDescription();
        this.player.loadVideoById(source.id);
    }
}

function parseYoutubeUrl (url) {
    // source: https://stackoverflow.com/questions/2499567/how-to-make-a-json-call-to-a-url/2499647#2499647
    let regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    let match = url.match(regExp);
    // match contains youtube url at [0] and 11-length id at [1]
    return (match && match[1].length == 11) ? match[1] : false;
}

function loadVideosAndPlayer(redditUrl) {

    fetch(redditUrl).then(response => { return response.json() }).then(data => {

        // Reset video storage
        video.sources = [];
        video.current = 0;
        video.total = 0;

        // Get Video Ids from Reddit
        let posts = data.data.children;
        video.total = posts.length;
        posts.forEach(data => {
            let post = data.data;
            let id = parseYoutubeUrl(post.url);
            let description = post.title;
            let permalink = post.permalink;
            if (id) {
                video.sources.push({id, description, permalink});
            }
        })
        video.updateDescription()

        // Then Prepare Video Player
        if (!video.playerLoaded) {
            preparePlayer();
        } else {
            video.play();
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
    video.player = new YT.Player('player', {
        videoId: video.currentId,
        events: {
            'onStateChange': (event) => {
                if (event.data === 0) {
                    video.next()
                }
            }
        }
    })
    video.playerLoaded = true;
}

function playSubredditVideos() {
    let subreddit = document.getElementById('subreddit-input').value;
    let limit = 100
    let url = 'https://www.reddit.com/r/' + subreddit + '.json' + '?' + 'limit=' + limit;
    loadVideosAndPlayer(url);
}

function prepareSubredditForm() {
    const form = document.getElementById('subreddit-selector');
    form.addEventListener('submit', () => {
        event.preventDefault(); // Don't reload page. 
        playSubredditVideos();
    });
}

function main() {
    prepareSubredditForm();
    playSubredditVideos();
}

main() // run this function on page load






