/* make a blue background */
document.body.style.backgroundColor = 'darkblue';
/* add this image of an idiot: https://i.ibb.co/hVnJ9pP/Screen-Shot-2022-08-10-at-4-27-50-PM.png */
var idiot = document.createElement('img');
idiot.src = 'https://i.ibb.co/k0bgTKR/Screen-Shot-2022-08-11-at-10-01-00-AM.png';
document.body.appendChild(idiot);
/* make it 16% */
idiot.style.width = '16%';
/* make it vertical centered */
idiot.style.position = 'absolute';
idiot.style.top = '50%';
idiot.style.transform = 'translateY(-50%)';
/* make is horizontally centered */
idiot.style.left = '50%';
idiot.style.transform += ' translateX(-50%)';
/* animate it to move both horizontally and vertically bouncing off of walls. use your own speed variables/functions for movement. */
var x = 0;
var y = 0;
var xSpeed = 1;
var ySpeed = 1;
var xDirection = 1;
var yDirection = 1;
var xMax = window.innerWidth;
var yMax = window.innerHeight;
function move() {
  x += xSpeed * xDirection;
  y += ySpeed * yDirection;
  if (x >= xMax) {
    xDirection = -1;
  } else if (x <= 0) {
    xDirection = 1;
  }
  if (y >= yMax) {
    yDirection = -1;
  } else if (y <= 0) {
    yDirection = 1;
  }
  idiot.style.left = x + 'px';
  idiot.style.top = y + 'px';
}
setInterval(move, 10);
/* add a box */
var box = document.createElement('div');
box.style.width = '100px';
box.style.height = '100px';
box.style.backgroundColor = 'red';
box.style.position = 'absolute';
box.style.top = '50%';
box.style.left = '50%';
box.style.transform = 'translate(-50%, -50%)';
document.body.appendChild(box);
/* make the box black */
box.style.backgroundColor = 'black';
/* make the box 150% */
box.style.width = '40%';
box.style.height = '80%';
/* add text and make it say hi */
var text = document.createElement('div');
text.innerHTML = 'Hi';
text.style.position = 'absolute';
text.style.top = '50%';
text.style.left = '50%';
text.style.transform = 'translate(-50%, -50%)';
document.body.appendChild(text);
/* make the text white */
text.style.color = 'white';
/* move to text up 15% */
text.style.transform += ' translateY(-150%)';
/* add text */
var text2 = document.createElement('div');
text2.innerHTML = 'Hi';
text2.style.position = 'absolute';
text2.style.top = '50%';
text2.style.left = '50%';
text2.style.transform = 'translate(-50%, -50%)';
document.body.appendChild(text2);
/* make it say ello */
text2.innerHTML = 'This was made by codex lol';
/* make it black */
text2.style.color = 'white';
/* add a button and make it say "Discord Server" */
var button = document.createElement('button');
button.innerHTML = 'Discord Server';
button.style.position = 'absolute';
button.style.top = '50%';
button.style.left = '50%';
button.style.transform = 'translate(-50%, -50%)';
document.body.appendChild(button);
/* move down 250% */
button.style.transform += ' translateY(250%)';
/* when button is clicked make it go to this website: https://discord.gg/jhDYr7c9d4 */
button.onclick = function() {
  window.location.href = 'https://discord.gg/jhDYr7c9d4';
};
/* add a button which says website */
var button2 = document.createElement('button');
button2.innerHTML = 'TeemSploit Website';
button2.style.position = 'absolute';
button2.style.top = '50%';
button2.style.left = '50%';
button2.style.transform = 'translate(-50%, -50%)';
document.body.appendChild(button2);
/* make it go to this website: https://teemsploit-executor.github.io/ */
button2.onclick = function() {
  window.location.href = 'https://teemsploit-executor.github.io/';
};
/* make it go down 300% */
button2.style.transform += ' translateY(450%)';
