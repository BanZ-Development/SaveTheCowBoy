document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#storyInput').addEventListener('click', function () {
            let page = document.querySelector('.createStory');
            page.style = 'height: 60vh; flex-direction: column; width: 95%;';
            document.querySelector('#createStoryTitle').style = 'display: block; padding: 10px; font-family: "Roboto"; background-color: #fff;';
            document.querySelector('#createStoryDesc').style = 'display: block; padding: 10px; font-family: "Roboto"; background-color: #fff;';
            document.querySelector('#storyInput').style = 'margin-inline: auto; width: 70%; margin-top: 10px; border: solid 1px #ccc; padding: 10px;';
    });
});

document.addEventListener('click', function(event) {
    let shrinkableDiv = document.querySelector('.createStory');
    if (!shrinkableDiv.contains(event.target)) {
        shrinkableDiv.style = 'flex-direction: row; width: 50%;';
        document.querySelector('#createStoryTitle').style = 'display: none;';
        document.querySelector('#createStoryDesc').style = 'display: none;';
        document.querySelector('#storyInput').style = 'margin-inline: none; width: calc(100% - 125px); margin-top: 0px; border: none; padding: 0px;';
    }
});