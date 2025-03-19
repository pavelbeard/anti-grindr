export default async function connectDb() {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      console.log("Connected to database");
      resolve();
    }, 1000);
  });
}
