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

document.addEventListener('DOMContentLoaded', () => {
        document.querySelector('#changeUserBtn').addEventListener('click', function() {
            const inputField = document.querySelector('#settingUsername');
            inputField.style = 'border: solid 1px #2782f2; width: 40%; margin-inline: 0px; height: 37px; font-family: "Roboto";';
            inputField.disabled = !inputField.disabled;
        });
});