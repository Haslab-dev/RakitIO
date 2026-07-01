const int buzzerPin = 8;
const int c = 262;
const int d = 294;
const int e = 329;
const int f = 349;
const int g = 392;
const int a = 440;
const int b = 440;
const int c5 = 523;

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  tone(buzzerPin, c);
  delay(200);
  noTone(buzzerPin);
  delay(100);
  tone(buzzerPin, e);
  delay(200);
  noTone(buzzerPin);
  delay(100);
  tone(buzzerPin, g);
  delay(200);
  noTone(buzzerPin);
  delay(100);
  tone(buzzerPin, c5);
  delay(400);
  noTone(buzzerPin);
  delay(1000);
}
