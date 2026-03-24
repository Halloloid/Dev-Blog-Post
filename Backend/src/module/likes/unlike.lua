-- KEYS[1] = likes:post:{postId}
-- KEYS[2] = likes:count:{postId}
-- KEYS[3] = likes:events
-- ARGV[1] = userId
-- ARGV[2] = postId

if redis.call("SISMEMBER",KEYS[1],ARGV[1]) == 0 then
    return 0
end

redis.call("SREM",KEYS[1],ARGV[1])
redis.call("DECR",KEYS[2])

--recording events in a stream
redis.call(
    "XADD",KEYS[3],"*",
    "postId",ARGV[2],
    "userId",ARGV[1],
    "action","unlike"
)

return 1