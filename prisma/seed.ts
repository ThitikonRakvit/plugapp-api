import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

const carData: Prisma.CarCreateInput[] = [
  {
    brand: "Tesla",
    model: "Model Y",
    batteryCapacity: 57.5,
    ac: 7.6,
    dc: 250,
  },
  {
    brand: "ORA",
    model: "Good Cat",
    batteryCapacity: 57.7,
    ac: 6.6,
    dc: 70,
  },
  {
    brand: "BYD",
    model: "ATTO 3",
    batteryCapacity: 50.25,
    ac: 7,
    dc: 70,
  },
];

const stationData: Prisma.ChargingStationCreateInput[] = [
  {
    name: "EVolt Charging Station",
    description:
      "25 ถนนกัลปพฤกษ์, แขวงคลองบางพราน เขตบางบอน กรุงเทพมหานคร 10150",
    latitude: 13.688655268612742,
    longitude: 100.43208995324909,
  },
  {
    name: "Evolt Charging Station",
    description:
      "เลขที่ 98 ถ. พระรามที่ 2 ตำบล นาดี อำเภอเมืองสมุทรสาคร สมุทรสาคร 74000",
    latitude: 13.572134576278582,
    longitude: 100.28901245324701,
  },
  {
    name: "EVolt Charging Station",
    description:
      "49/32-34 ถนน งามวงศ์วาน ตำบลบางเขน อำเภอเมืองนนทบุรี นนทบุรี 11000",
    latitude: 13.866416178127121,
    longitude: 100.5425486884439,
  },
  {
    name: "Evolt Charging Station",
    description:
      "126 ถนนประชาอุทิศ , แขวงบางมด, เขตทุ่งครุ, กรุงเทพมหานคร 10140",
    latitude: 13.660973648000493,
    longitude: 100.49370310216612,
  },
];

async function main() {
  for (const c of carData) {
    const car = await prisma.car.create({
      data: c,
    });
    console.log(`Created car with id: ${car.id}`);
  }
  for (const s of stationData) {
    const station = await prisma.chargingStation.create({
      data: s,
    });
    console.log(`Created station with id: ${station.id}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
