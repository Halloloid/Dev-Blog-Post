import {Client} from "@upstash/qstash"
import {config} from "dotenv"

config();

const qstash = new Client({
    token:process.env.QSTASH_TOKEN!
})

async function setup(){
    await qstash.publishJSON({
        url:"http://localhost:5000/internal/sync-likes",
        body:{},
        cron:"*/5 * * * *"
    });

    console.log("QStash sync scheduled")
}

setup();