import {Client} from "@upstash/qstash"
import {config} from "dotenv"

config();

const qstash = new Client({
    token:process.env.QSTASH_TOKEN!
})

async function setup(){
    await qstash.schedules.create({
    destination: "https://dev-blog-post.onrender.com/internal/sync-likes",
    cron: "*/5 * * * *",
    method:"POST"
});

await qstash.schedules.create({
    destination: "https://dev-blog-post.onrender.com/internal/sync-views",
    cron: "*/5 * * * *",
    method:"POST"
});


    console.log("QStash sync scheduled")
}

setup();