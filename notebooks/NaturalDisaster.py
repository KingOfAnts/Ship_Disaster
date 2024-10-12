class NaturalDisaster:
    def __init__(self, name, location, delay, severity):
        self.name = name
        self.location = location
        self.delay = delay
        self.severity = severity

    def get_delay(self):
        return self.delay
    
    def get_severity(self):
        return self.severity
    
class Earthquake(NaturalDisaster):
    def __init__(self, name, location, delay, severity, magnitude):
        super().__init__(name, location, delay, severity)
        self.magnitude = magnitude

    def get_magnitude(self):
        return self.magnitude
    
class Hurricane(NaturalDisaster):
    def __init__(self, name, location, delay, severity, category):
        super().__init__(name, location, delay, severity)
        self.category = category

    def get_category(self):
        return self.category
    
class Tsunami(NaturalDisaster):
    def __init__(self, name, location, delay, severity, wave_height):
        super().__init__(name, location, delay, severity)
        self.wave_height = wave_height

    def get_wave_height(self):
        return self.wave_height