--KEYS[1] = views:post:{postId}
--KEYS[2] = views:post:{postId}:seen
--KEYS[3] = views:dirty
--ARGV[1] = viewerId
--ARGV[2] = postId
--ARGV[3] = ttl(seconds)

if redis.call("SISMEMBER",KEYS[2],ARGV[1]) == 1 then
    return 0
end

redis.call("SADD",KEYS[2],ARGV[1])
redis.call("EXPIRE",KEYS[2],ARGV[3])
redis.call("INCR",KEYS[1])
redis.call("SADD",KEYS[3],ARGV[2])

return 1