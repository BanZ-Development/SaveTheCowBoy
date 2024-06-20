function switchSetting(sub) {

    let settings = document.querySelectorAll('#settingsType');
    for (i=0; i < settings.length; i++) {
        document.querySelectorAll('#settingsType')[i].style = 'display: none;';
    }
    document.querySelectorAll('#settingsType')[sub].style = 'display: flex;';

}

var loadFile = function (event) {
    var image = document.getElementById("imagePreview");
    image.src = URL.createObjectURL(event.target.files[0]);
};

function changeUsername() {
    document.getElementById('username').removeAttribute('disabled')
}

function ChangePassword() {

}