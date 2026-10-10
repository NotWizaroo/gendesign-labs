// Листинг 3 — из методички к лабе 2 (неравные веса: 60% пение, 10% танцы, 30% сон).
// В PDF это «голые» строки; обёрнуты в run(). Клик — бросить ещё раз.

function setup() {
  noCanvas();
  run();
}

function mousePressed() {
  run();
}

function run() {
  let num = random(1);
  if (num < 0.6) {
    print("Sing!");
    //Если случайное число меньше 0,6
  } else if (num < 0.7) {
    print("Dance!");
    //Больше или равно 0,6 и меньше 0,7
  } else {
    print("Sleep!");
  }
  //Все остальные случаи (больше или равно 0,7)
}
