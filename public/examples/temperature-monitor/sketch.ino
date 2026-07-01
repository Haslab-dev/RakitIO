const int dataPin = 2;
float temp = 25.0;
float humidity = 60.0;
int counter = 0;

void setup() {
  Serial.begin(9600);
  pinMode(dataPin, INPUT);
  Serial.println("Temperature Monitor Ready");
}

void loop() {
  counter++;
  temp = 20.0 + (counter % 10);
  humidity = 50.0 + (counter % 20);

  Serial.print("Temperature: ");
  Serial.print(temp);
  Serial.print(" C, Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");

  delay(2000);
}
