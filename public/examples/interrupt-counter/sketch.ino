const int buttonPin = 2;
const int ledPin = 13;
volatile int interruptCount = 0;

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    interruptCount++;
    Serial.print("Count: ");
    Serial.println(interruptCount);
    while (digitalRead(buttonPin) == LOW) {
      delay(10);
    }
  }
  digitalWrite(ledPin, HIGH);
  delay(100);
  digitalWrite(ledPin, LOW);
  delay(100);
}
