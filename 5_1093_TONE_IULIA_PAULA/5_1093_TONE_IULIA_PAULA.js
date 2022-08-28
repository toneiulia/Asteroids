//asteroizii mei
let asteroizi = [];

const VITEZA_NAVA = 5; // accelerare nava
const GRAD_ROTIRE = 360;
const FPS = 50;
const FRECARE = 0.7;
const RACHETE_MAXIME = 3; // nu pot lansa mai mult de 3 rachete simultan
const VITEZA_RACHETA = 50;
let VIETI_JOC = 3;
let bool = true;
let PUNCTE = 0;
let milisecundeImunitate = 0;
let start = true;
let NUME;
let NUME_JUCATORI=[];
let scoruri = [];


// stabilesc culorile in functie de marime (1-4)
const culori = ['white', 'red', 'green', 'orange'];
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

// singura nava spatiala
let nava = {
    areRachete: true,
    rachete: [],
    x: canvas.width / 2,
    y: canvas.height - 30,
    r: 15,
    a: 90 / 180 * Math.PI,
    rot: 0,
    rotire: false,
    rotatie: {
        x: 0,
        y: 0
    }
}

// evenimente miscare nava
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function topJucatori(){
    scoruri = scoruri.sort((a, b) => b.value - a.value);
    console.log(scoruri.key + ' '+scoruri.value)
    if(scoruri.length>3){
        let removed = scoruri.splice(-1,1);
        console.log('rem '+removed)
        console.log(scoruri.length)
    }
    localStorage.clear();
    for(let i=0;i<scoruri.length;i++){
        localStorage.setItem(scoruri[i].key,scoruri[i].value);
    }
}

function animatie() {
    setInterval(function () {
        if (!bool) {
            alert("Viata pierduta!");
            bool = true;
            if (VIETI_JOC == 0) {
                let pereche ={
                    key: NUME,
                    value: PUNCTE
                }
                localStorage.setItem(NUME,PUNCTE);
                scoruri.push(pereche);
                topJucatori();
                alert("Incepem joc nou!");
                NUME = prompt("Introdu numele tau:");
                PUNCTE = 0;
                VIETI_JOC = 3;
            } else {
                nava.x = canvas.width / 2;
                nava.y = canvas.height - 30;
                misca();
            }
        }
        else{ if(start) {start=false;NUME = prompt("Introdu numele tau:");  }
            misca();} 
    }, 1000 / 30); 
}

function keyDown(ev) {
    switch (ev.keyCode) {
        case 88: // lanseaza rachete
            lanseazaRachete();
            break;
        case 90: // sageata stanga -> roteste nava la stanga
            nava.rot = GRAD_ROTIRE / 360 * Math.PI/FPS ;
            break;
        case 38: // misca nava in sus
            nava.rotire = true;
            nava.y -= 30;
            break;
        case 40: // misca nava in jos
            nava.rotire = true;
            nava.y += 30;
            break;
        case 37: // miscare stanga
            nava.rotire = true;
            nava.x -= 30;
            break;
        case 39: // miscare dreapta
            nava.rotire = true;
            nava.x += 30;
            break;
        case 67: // sageata dreapta -> roteste nava la dreapta
            nava.rot = -GRAD_ROTIRE / 360 * Math.PI /FPS;
            break;
    }
}

function keyUp(ev) {
    switch (ev.keyCode) {
        case 88: // permite lansare rachete
            nava.areRachete = true;
            break;
        case 90: // sageata stanga -> opreste rotirea la stanga
            nava.rot = 0;
            break;
        case 40: // misca nava in sus
            nava.rotire = false;
            break;
        case 38: // oprire miscare nava in sus
            nava.rotire = false;
            break;
        case 67: // sageata dreapta -> opreste rotirea la dreapta
            nava.rot = 0;
            break;
    }
}

let noAsteroids = 10;
function creareAsteroizi() {
    for (let i = 0; i < noAsteroids; i++) {
        let val = Math.floor(Math.random() * 4) + 1; // valoare aleatoare 1-4 (rachete necesare)
        let r = val * 15;  // raza asteroidului
        // scad r sa nu iasa din canvas -> cu abs sa nu fie negativ
        let y = Math.abs(Math.floor(Math.random() * (canvas.height - r)) - 100); // pozitie random pe canvas; scad 100 sa am loc ptr nave
        let x = Math.abs(Math.floor(Math.random() * (canvas.width - r)));
        let ast = {
            val: val, x: x, y: y, r: r,
            xv: Math.random() * 25 / 30 * (Math.random() < 0.5 ? 1 : -1), // viteza random
            yv: Math.random() * 25 / 30 * (Math.random() < 0.5 ? 1 : -1) // viteza random
        }
        asteroizi.push(ast);
    }
}

function coliziune(a, b) {
    // distanta dintre cei doi asteroizi
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    let d = Math.sqrt(dx * dx + dy * dy);
    // vector unitate pe traiectorie
    let ux = dx / d;
    let uy = dy / d;
    // daca cei doi asteroizi se suprapun
    if (d < a.r + b.r) {  // nu maresc viteza prea mult
        a.xv -= ux;
        a.yv -= uy;
        b.xv += ux;
        b.yv += uy;
    }
}

function reducereVieti(asteroid, nava) {
    let dx = nava.x - asteroid.x;
    let dy = nava.y - asteroid.y;
    let d = Math.sqrt(dx * dx + dy * dy);

    if (d < asteroid.r + nava.r) {  
        VIETI_JOC--;
        asteroid.x += nava.r + 10;
        asteroid.y += nava.r + 10;
        bool = false;
    }
}

function iesireDinEcran(obiect) {

    if (obiect.x < 0 - obiect.r) {
        obiect.x = canvas.width + obiect.r;
    } else if (obiect.x > canvas.width + obiect.r) {
        obiect.x = 0 - obiect.r
    }
    if (obiect.y < 0 - obiect.r) {
        obiect.y = canvas.height + obiect.r;
    } else if (obiect.y > canvas.height + obiect.r) {
        obiect.y = 0 - obiect.r
    }
}

function lanseazaRachete() {
    // creare racheta
    if (nava.areRachete && nava.rachete.length < RACHETE_MAXIME) {
        nava.rachete.push({ // din varf
            x: nava.x + 4 / 3 * nava.r * Math.cos(nava.a),
            y: nava.y - 4 / 3 * nava.r * Math.sin(nava.a),
            xv: VITEZA_RACHETA * Math.cos(nava.a) / (FPS),
            yv: -VITEZA_RACHETA * Math.sin(nava.a) / (FPS),
            explodeTime: 0,
            dist: 0
        });
    }
    // preventie lansare rachete
    nava.areRachete = false;
}
function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function misca() {
    // desenez fundal negru 
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // scriere puncte in colt stanga sus
    context.beginPath();  // incep desenul
    context.fillStyle = "white";  // setez pe negru
    context.font = "20px Verdana";  //font si marime
    context.fillText("PUNCTE JOC: " + PUNCTE, 20, 30);  //vreau sa scriu nr rachete
    context.closePath();
    context.stroke();

    // rotire nava
    if (nava.rotire) {
        nava.rotatie.x += VITEZA_NAVA * Math.cos(nava.a) / FPS;
        nava.rotatie.y -= VITEZA_NAVA * Math.sin(nava.a) / FPS;

    } else {
        // aplicare frecare astfel incat nava sa incetineasca miscarea
        nava.rotatie.x -= FRECARE * nava.rotatie.x / FPS;
        nava.rotatie.y -= FRECARE * nava.rotatie.y / FPS;
    }

    // desenare nava triunghi
    context.strokeStyle = "white";
    context.lineWidth = 30 / 20;
    context.beginPath();
    context.moveTo( // varf
        nava.x + 4 / 3 * nava.r * Math.cos(nava.a),
        nava.y - 4 / 3 * nava.r * Math.sin(nava.a)
    );
    context.lineTo( // stanga
        nava.x - nava.r * (2 / 3 * Math.cos(nava.a) + Math.sin(nava.a)),
        nava.y + nava.r * (2 / 3 * Math.sin(nava.a) - Math.cos(nava.a))
    );
    context.lineTo( // dreapta
        nava.x - nava.r * (2 / 3 * Math.cos(nava.a) - Math.sin(nava.a)),
        nava.y + nava.r * (2 / 3 * Math.sin(nava.a) + Math.cos(nava.a))
    );
    context.closePath();
    context.stroke();
    context.strokeStyle = "black";


    for (let k = 0; k < VIETI_JOC; k++) {
        let x = canvas.width - 150, y = 30;
        context.beginPath();  // incep desenul
        context.arc(x + k * 30, y, 10, 0, 2 * Math.PI); // desenez asteroidul
        // generez culoare random:
        context.fillStyle = 'red';
        // context.strokeStyle = 'black';  //stil culoare
        context.fill();  // umplu cu culoare
        context.stroke();
        context.closePath();
    }

    for (let i = 0; i < asteroizi.length; i++) {
        // miscare asteroid pe linie
        asteroizi[i].x +=asteroizi[i].xv;
        asteroizi[i].y += asteroizi[i].yv;

        for (let j = i + 1; j < asteroizi.length; j++)
           coliziune(asteroizi[i], asteroizi[j])

        if (bool)
            reducereVieti(asteroizi[i], nava)


        // desenare asteroizi
        let val = asteroizi[i].val;
        let x = asteroizi[i].x;
        let y = asteroizi[i].y;
        let r = asteroizi[i].r;
        context.beginPath();  // incep desenul
        context.arc(x, y, r, 0, 2 * Math.PI); // desenez asteroidul
        // generez culoare random:
        context.fillStyle = culori[val - 1];
        // context.strokeStyle = 'black';  //stil culoare
        context.fill();  // umplu cu culoare
        context.stroke();
        context.fillStyle = "black";  // setez pe negru
        context.font = "10px Verdana";  //font si marime
        context.fillText(val, x, y);  //vreau sa scriu nr rachete
        context.closePath();
        context.stroke();
        // sa nu iasa din ecran asteroizii 
        iesireDinEcran(asteroizi[i]);
        context.strokeStyle = "black";
        // rotire nava
        nava.a += nava.rot;
        // miscare nava
        // nava.x += nava.rotatie.x;
        // nava.y += nava.rotatie.y;
        // sa nu iasa din ecran -> revine pe cealalta parte
        iesireDinEcran(nava);


        // desenare racheta
        for (let i = 0; i < nava.rachete.length; i++) {
            if (nava.rachete[i].explodeTime == 0) {
                context.fillStyle = "salmon";
                context.beginPath();
                context.arc(nava.rachete[i].x, nava.rachete[i].y, 2, 0, Math.PI * 2, false);
                context.fill();
            } else {
                // explozie
                context.fillStyle = "orangered";
                context.beginPath();
                context.arc(nava.rachete[i].x, nava.rachete[i].y, nava.r * 0.75, 0, Math.PI * 2, false);
                context.fill();
                context.fillStyle = "salmon";
                context.beginPath();
                context.arc(nava.rachete[i].x, nava.rachete[i].y, nava.r * 0.5, 0, Math.PI * 2, false);
                context.fill();
                context.fillStyle = "pink";
                context.beginPath();
                context.arc(nava.rachete[i].x, nava.rachete[i].y, nava.r * 0.25, 0, Math.PI * 2, false);
                context.fill();
            }
        }

        // miscare racheta
        for (let i = nava.rachete.length - 1; i >= 0; i--) {
            // distanta parcursa
            if (nava.rachete[i].dist > 0.6 * canvas.width) {
                nava.rachete.splice(i, 1);
                continue;
            }
            // explozie
            if (nava.rachete[i].explodeTime > 0) {
                nava.rachete[i].explodeTime--;
                // distrugere laser dupa anumit timp
                if (nava.rachete[i].explodeTime == 0) {
                    nava.rachete.splice(i, 1);
                    continue;
                }
            } else {
                // miscare racheta
                nava.rachete[i].x += nava.rachete[i].xv;
                nava.rachete[i].y += nava.rachete[i].yv;
                // distanta parcursa
                nava.rachete[i].dist += Math.sqrt(Math.pow(nava.rachete[i].xv, 2) + Math.pow(nava.rachete[i].yv, 2));
            }
        }
        // detectare lovitura racheta catre asteroid
        let ax, ay, ar, lx, ly;
        for (let i = asteroizi.length - 1; i >= 0; i--) {
            ax = asteroizi[i].x;
            ay = asteroizi[i].y;
            ar = asteroizi[i].r;
            for (let j = nava.rachete.length - 1; j >= 0; j--) {
                lx = nava.rachete[j].x;
                ly = nava.rachete[j].y;
                // detectare lovitura
                if (nava.rachete[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {
                    lovireAsteroid(i);
                    nava.rachete[j].explodeTime = Math.ceil(0.1 * FPS);
                    break;
                }
            }
        }
    }
    if (milisecundeImunitate > 0)
        milisecundeImunitate--;
    else milisecundeImunitate = 6000;
}
// scade nr de rachete necesar sau elimina asteroidul
function lovireAsteroid(index) {
    asteroizi[index].val--; // actualizare valoare
    PUNCTE++;
    // la fiecare 5 puncte mai adaug o viata
    if (PUNCTE % 5 == 0&&VIETI_JOC<3) VIETI_JOC++;
    asteroizi[index].r = asteroizi[index].val * 10; // actualizare raza
    if (asteroizi[index].val == 0)
        asteroizi.splice(index, 1);
}
creareAsteroizi();

animatie();