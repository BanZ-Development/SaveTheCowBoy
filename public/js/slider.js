
(function(){
    var f = function() {
        links = ['https://banz.dev'];
        titles = ['Save The Cowboy'];
        desc = ['Embracing God and his glorious creation we call earth. Donate today to help raise cattle to feed starving families.'];
        repo = ['https://github.com/Raidlucky/Banz-Website'];
        for (i=0; i < 4;i++) {
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