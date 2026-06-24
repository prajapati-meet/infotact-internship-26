package com.payment.ledger.service;

import com.payment.ledger.dto.response.CachedResponse;
import com.payment.ledger.exception.InvalidIdempotencyKeyException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.function.Supplier;

@Service
public class IdempotencyServiceImpl implements IdempotencyService {

    private static final String LOCK_PREFIX = "idempotency:lock:";
    private static final String RESPONSE_PREFIX = "idempotency:response:";

    private static final Duration LOCK_TTL = Duration.ofSeconds(30);

    private static final Duration RESPONSE_TTL = Duration.ofHours(24);

    private final RedisTemplate<String, Object> redisTemplate;

    public IdempotencyServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public <T> T executeIdempotent(String idempotencyKey, Class<T> responseType, Supplier<T> operation) {

        String lockKey = LOCK_PREFIX + idempotencyKey;
        String responseKey = RESPONSE_PREFIX + idempotencyKey;

        Object cached = redisTemplate.opsForValue().get(responseKey);
        if (cached != null) {
            return responseType.cast(cached);
        }

        Boolean lockAcquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "PROCESSING", LOCK_TTL);

        if (Boolean.FALSE.equals(lockAcquired)) {
            Object justFinished = redisTemplate.opsForValue().get(responseKey);
            if (justFinished != null) {
                return responseType.cast(justFinished);
            }
            throw new InvalidIdempotencyKeyException("A request with this idempotency key is already being processed. Please retry shortly.");
        }

        try {
            T result = operation.get();
            redisTemplate.opsForValue().set(responseKey, result, RESPONSE_TTL);

            return result;
        } finally {
            redisTemplate.delete(lockKey);
        }
    }
}