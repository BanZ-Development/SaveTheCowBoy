function switchSetting(sub) {

    let settings = document.querySelectorAll('#settingsType');
    for (i=0; i < settings.length; i++) {
        document.querySelectorAll('#settingsType')[i].style = 'display: none;';
    }
    document.querySelectorAll('#settingsType')[sub].style = 'display: flex;';

}