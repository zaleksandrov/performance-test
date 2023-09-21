console.log("Test worker Init");

self.onmessage = () => {
    console.log("Received message in test worker");
}