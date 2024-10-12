class NaturalDisaster:
    def __init__(self, name, location, delay, severity, radius):
        self.name = name
        self.location = location
        self.delay = delay
        self.severity = severity
        self.radius = radius

    def get_delay(self):
        return self.delay
    
    def get_severity(self):
        return self.severity
    
class Earthquake(NaturalDisaster):
    def __init__(self, location, delay, severity, radius):
        super().__init__("Earthquake", location, delay, severity, radius)

    
class Hurricane(NaturalDisaster):
    def __init__(self, location, delay, severity, radius):
        super().__init__("Hurricane", location, delay, severity, radius)

    
class Tsunami(NaturalDisaster):
    def __init__(self, location, delay, severity, radius):
        super().__init__("Tsunami", location, delay, severity, radius)

    def get_wave_height(self):
        return self.wave_height