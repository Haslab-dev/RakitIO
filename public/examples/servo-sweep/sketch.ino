const int servoPin = 9;
const int potPin = A0;
int pos = 0;

void setup() {
  Serial.begin(9600);
  pinMode(servoPin, OUTPUT);
}

void loop() {
  int potValue = analogRead(potPin);
  pos = (potValue * 180) / 1023;
  analogWrite(servoPin, (pos * 255) / 180);
  Serial.println(pos);
  delay(15);
}
