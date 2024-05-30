
(function(){
    var f = function() {
        links = ['https://banz.dev'];
        titles = ['Long X Ranch Cowboys'];
        desc = ['Long X Ranch Cowboys needs your help to help feed starving children around the world. We believe everyone around the world should have food on their plate. Donate today to help raise cattle to feed starving families. We aim to feed the whole worlld while following the teachings of Jesus Christ.'];
        repo = ['https://github.com/Raidlucky/Banz-Website'];
        for (i=0; i < 2;i++) {
            let slide = document.querySelectorAll('.slide')[i].style.display;
            if (slide === 'block') {
                curr = i;
                document.querySelectorAll('.slide')[i].style.display = 'none';
            }
        }
        if (curr === 3) {curr = -1;}
        anime({targets: ".slide",opacity: [1, 0],duration: 500,easing: 'linear'});
        document.querySelectorAll('.slide')[curr+1].style.display = 'block';
        document.getElementById('link').setAttribute('href', links[0]);
        document.getElementById('title').innerHTML = titles[0];
        document.getElementById('desc').innerHTML = desc[0];
        document.getElementById('repo').setAttribute('href', repo[0]);
        anime({targets: ".slide",opacity: [0, 1],duration: 500,easing: 'linear'});
        document.querySelector('.progressIn').style.width = '0%';
        anime({targets: '.progressIn',duration: '15000',width: ['0%', '100%'],easing: 'linear'});
        console.log('Switched Slide')
    };
    window.setInterval(f, 15000);
    f();
})();

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