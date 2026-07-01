const int trigPin = 9;
const int echoPin = 10;
const int pumpPin = 7;
const int soilPin = A0;
const int lightPin = A1;
int loopCount = 0;

void setup() {
  Serial.begin(9600);
  pinMode(pumpPin, OUTPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  digitalWrite(pumpPin, LOW);
}

void loop() {
  int soilValue = analogRead(soilPin);
  int lightValue = analogRead(lightPin);
  long duration;
  long distance;

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = (duration / 2) / 29;

  Serial.print("Soil: ");
  Serial.print(soilValue);
  Serial.print(" Light: ");
  Serial.print(lightValue);
  Serial.print(" Water: ");
  Serial.print(distance);
  Serial.println(" cm");

  if (soilValue < 300) {
    Serial.println("Dry - pump on!");
    digitalWrite(pumpPin, HIGH);
    delay(2000);
    digitalWrite(pumpPin, LOW);
  }

  if (lightValue < 300) {
    Serial.println("Low light!");
  }

  if (distance < 5) {
    Serial.println("Low water!");
  }

  delay(5000);
}
