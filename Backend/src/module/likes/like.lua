-- KEYS[1] = likes:post:{postId}
-- KEYS[2] = likes:count:{postId}
-- KEYS[3] = likes:delta:{postId}
-- KEYS[4] = likes:dirty
-- ARGV[1] = userId
-- ARGV[2] = postId

if redis.call("SISMEMBER",KEYS[1],ARGV[1]) == 1 then 
    return 0
end

redis.call("SADD",KEYS[1],ARGV[1])
redis.call("INCR",KEYS[2])
redis.call("INCR",KEYS[3])
redis.call("SADD",KEYS[4],ARGV[2])

return 1
