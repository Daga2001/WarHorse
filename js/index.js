// menú de start
let menu__start = document.querySelector('.menu__start');
menu__start.onclick = function() {
    menu__start.classList.toggle('active');
}

// dificultades
document.getElementById('easy').addEventListener('mousedown', ( event ) => {   
    localStorage.setItem('difficulty', '1');
});

document.getElementById('normal').addEventListener('mousedown', ( event ) => {   
    localStorage.setItem('difficulty', '2');
});

document.getElementById('hard').addEventListener('mousedown', ( event ) => {   
    localStorage.setItem('difficulty', '3');
});