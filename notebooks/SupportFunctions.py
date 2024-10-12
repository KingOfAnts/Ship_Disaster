import math

class Point:
    
    def __init__(self, name, type, X, Y, Z):
        self.name = name
        self.type = type
        self.X = X
        self.Y = Y
        self.Z = Z

    def get_name():
        return self.name
    def get_type():
        return self.type
    def get_X():
        return self.X
    def get_Y():
        return self.Y
    def get_Z():
        return self.Z
    
    

   

def estimated_distance(Radius, Point1, Point2):#Radius in Radians
    temp = (Point1.get_X *Point2.get_X + Point1.get_Y *Point2.get_Y + Point1.get_Z *Point2.get_Z)/(Radius*Radius)
    distance = Radius * math.acos(temp)
    
    return distance
def simple_estimated_time(Speed,Distance):#Speed = X unit of move per second?
    return Speed*Distance
def happy_calculator(Distance, Est_Time, Act_Time):#cargo possible factor too
    happy = 0
    if (Distance >= 100):
        if (Act_Time <= Est_Time + 20):
            happy = 20
        elif(Act_Time <= Est_Time+30):
            happy = 0
        elif(Act_Time >= Est_Time+30):
            happy = -10
    elif (Distance <= 100):
        if (Act_Time <= Est_Time):
            happy = 20
        elif(Act_Time <= Est_Time+10):
            happy = 0
        elif(Act_Time >= Est_Time+20):
            happy = -10