-- KEYS[1] = likes:post:{postId}
-- KEYS[2] = likes:count:{postId}
-- KEYS[3] = likes:delta:{postId}
-- KEYS[4] = likes:dirty
-- ARGV[1] = userId
-- ARGV[2] = postId

if redis.call("SISMEMBER",KEYS[1],ARGV[1]) == 0 then
    return 0
end

redis.call("SREM",KEYS[1],ARGV[1])
redis.call("DECR",KEYS[2])
redis.call("DECR",KEYS[3])
redis.call("SADD",KEYS[4],ARGV[2])

return 1