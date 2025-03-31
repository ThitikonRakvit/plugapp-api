require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const geolib = require("geolib");

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(express.json());

const prisma = new PrismaClient();

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  res.json({
    message: "User registered successfully",
    user: { id: user.id, username: user.email },
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    message: "Login successful",
    user: { id: user.id, username: user.email },
  });
});

app.post("/user-car", async (req, res) => {
  const { name, brand, model, userId } = req.body;

  try {
    const car = await prisma.car.findFirst({
      where: { brand, model },
    });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const userCarRel = await prisma.userCarRel.create({
      data: {
        name,
        userId: Number(userId),
        carId: car.id,
      },
    });

    res.status(201).json({ message: "User-Car relation added", userCarRel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding UserCarRel", error });
  }
});

app.get("/user-cars/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const userCars = await prisma.userCarRel.findMany({
      where: { userId: Number(userId) },
      include: {
        Car: true,
      },
    });

    if (!userCars || userCars.length === 0) {
      return res.status(404).json({ message: "No cars found for this user." });
    }

    const carData = userCars.map((userCar) => ({
      name: userCar.name,
      car: userCar.Car,
    }));

    res.status(200).json({ message: "User cars found", data: carData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving user cars", error });
  }
});

app.get("/charging-stations", async (req, res) => {
  try {
    const chargingStations = await prisma.chargingStation.findMany();

    if (!chargingStations || chargingStations.length === 0) {
      return res.status(404).json({ message: "No charging stations found" });
    }

    res.status(200).json({
      message: "Charging stations fetched successfully",
      data: chargingStations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching charging stations",
      error: error.message,
    });
  }
});

const userLocation = {
  latitude: 13.73037296485693,
  longitude: 100.7800772848435,
};

app.get("/charging-stations/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const chargingStation = await prisma.chargingStation.findUnique({
      where: { id: Number(id) },
    });

    if (!chargingStation) {
      return res.status(404).json({ message: "Charging station not found" });
    }

    const stationLocation = {
      latitude: chargingStation.latitude,
      longitude: chargingStation.longitude,
    };

    const distance = geolib.getDistance(userLocation, stationLocation);

    res.status(200).json({
      message: "Charging station found",
      data: chargingStation,
      distance: `${(distance / 1000).toFixed(2)} km.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching charging station",
      error: error.message,
    });
  }
});

app.get("/car/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const car = await prisma.car.findUnique({
      where: { id: Number(id) },
    });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({
      message: "Car details fetched successfully",
      data: car,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching car details",
      error: error.message,
    });
  }
});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
