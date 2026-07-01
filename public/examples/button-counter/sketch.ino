const int buttonPin = 2;
const int ledPin = 13;
int buttonState = 0;
int lastButtonState = 0;
int counter = 0;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  buttonState = digitalRead(buttonPin);

  if (buttonState != lastButtonState) {
    if (buttonState == LOW) {
      counter++;
      Serial.print("Button pressed! Count: ");
      Serial.println(counter);
      digitalWrite(ledPin, HIGH);
    } else {
      digitalWrite(ledPin, LOW);
    }
    delay(50);
  }
  lastButtonState = buttonState;
}
