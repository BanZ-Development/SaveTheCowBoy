document.addEventListener('DOMContentLoaded', function() {
    var f = function() {
        let links = ['signup'];
        let titles = ['Long X Ranch Cowboys'];
        let desc = ['Long X Ranch Cowboys needs your help to help feed starving families around the world. We believe everyone around the world should have food on their plate. Donate today to help raise cattle to feed starving families. We aim to feed the whole world while following the teachings of Jesus Christ.'];
        let repo = ['']; // donate link

        let slide = document.querySelectorAll('.slide');
        let curr = -1; // initialize curr to -1

        // Find the currently displayed slide
        for (let i = 0; i < slide.length; i++) {
            if (slide[i].style.display === 'block') {
                curr = i;
                slide[i].style.display = 'none';
                break; // Exit the loop once the current slide is found
            }
        }

        if (curr === 3) {curr = -1;}

        anime({
            targets: ".slide",
            opacity: [1, 0],
            duration: 500,
            easing: 'linear'
        });

        if (slide[curr + 1]) {
            slide[curr + 1].style.display = 'block';
        } else if (slide.length > 0) {
            slide[0].style.display = 'block';
        }

        document.getElementById('link').setAttribute('href', links[0]);
        document.getElementById('title').innerHTML = titles[0];
        document.getElementById('desc').innerHTML = desc[0];
        document.getElementById('repo').setAttribute('href', repo[0]);

        anime({
            targets: ".slide",
            opacity: [0, 1],
            duration: 500,
            easing: 'linear'
        });

        document.querySelector('.progressIn').style.width = '0%';
        anime({
            targets: '.progressIn',
            duration: 15000,
            width: ['0%', '100%'],
            easing: 'linear'
        });
    };

    window.setInterval(f, 15000);
    f();
});

// Subscription Slider

function slideRight() {
    document.getElementById('subscriptions').scrollLeft += 1400;
    if (document.getElementById('subscriptions').scrollLeft == 1374) {
        document.getElementById('subscriptions').scrollLeft = 0;
    }
};

function slideLeft() {
    document.getElementById('subscriptions').scrollLeft -= 1400;
    if (document.getElementById('subscriptions').scrollLeft == 0) {
        document.getElementById('subscriptions').scrollLeft = 1374;
    }
};