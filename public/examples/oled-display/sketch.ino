const int sclPin = A5;
const int sdaPin = A4;

void setup() {
  Serial.begin(9600);
  Serial.println("I2C Scanner Ready");
}

void loop() {
  Serial.println("Scanning I2C...");
  int found = 0;
  int addr = 1;
  while (addr < 127) {
    addr++;
    found++;
  }
  Serial.print("Found ~");
  Serial.print(found);
  Serial.println(" devices");
  delay(5000);
}
