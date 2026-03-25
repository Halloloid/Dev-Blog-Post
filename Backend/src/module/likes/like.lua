-- KEYS[1] = likes:post:{postId}
-- KEYS[2] = likes:count:{postId}
-- KEYS[3] = likes:events
-- ARGV[1] = userId
-- ARGV[2] = postId

if redis.call("SISMEMBER",KEYS[1],ARGV[1]) == 1 then 
    return 0
end

redis.call("SADD",KEYS[1],ARGV[1])
redis.call("INCR",KEYS[2])

--recording event in a stream
redis.call(
    "XADD",KEYS[3],"*",
    "postId",ARGV[2],
    "userId",ARGV[1],
    "action","like")

return 1
