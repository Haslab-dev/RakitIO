const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;
const int potPin = A0;
int counter = 0;

void setup() {
  Serial.begin(9600);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
}

void loop() {
  int potValue = analogRead(potPin);
  int colorPosition = (potValue * 255) / 1023;

  int r;
  int g;
  int b;

  if (colorPosition < 85) {
    r = 255 - (colorPosition * 3);
    g = colorPosition * 3;
    b = 0;
  } else if (colorPosition < 170) {
    r = 0;
    g = 255 - ((colorPosition - 85) * 3);
    b = (colorPosition - 85) * 3;
  } else {
    r = (colorPosition - 170) * 3;
    g = 0;
    b = 255 - ((colorPosition - 170) * 3);
  }

  analogWrite(redPin, r);
  analogWrite(greenPin, g);
  analogWrite(bluePin, b);

  Serial.print("R:");
  Serial.print(r);
  Serial.print(" G:");
  Serial.print(g);
  Serial.print(" B:");
  Serial.println(b);

  delay(100);
}
