package com.payment.ledger.service;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;


@ExtendWith(MockitoExtension.class)
 class IdempotencyServiceImplTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private IdempotencyServiceImpl idempotencyService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void executeIdempotent_WithNewKey_ShouldExecuteOperation() {

        String idempotencyKey = "test-key";
        String lockKey = "idempotency:lock:" + idempotencyKey;
        String responseKey = "idempotency:response:" + idempotencyKey;
        String expectedResponse = "SUCCESS";

        AtomicInteger executionCount = new AtomicInteger(0);

        // No cached response exists
        when(valueOperations.get(responseKey)).thenReturn(null);

        // Lock acquisition succeeds
        when(valueOperations.setIfAbsent(
                eq(lockKey),
                eq("PROCESSING"),
                eq(Duration.ofSeconds(30))
        )).thenReturn(true);

        // Act
        String result = idempotencyService.executeIdempotent(
                idempotencyKey,
                String.class,
                () -> {
                    executionCount.incrementAndGet();
                    return expectedResponse;
                }
        );

        // Assert
        assertEquals(expectedResponse, result);
        assertEquals(1, executionCount.get());

        // Verify response cached
        verify(valueOperations).set(
                eq(responseKey),
                eq(expectedResponse),
                eq(Duration.ofHours(24))
        );

        // Verify lock removed
        verify(redisTemplate).delete(lockKey);

        // Verify operation executed exactly once
        verify(valueOperations).get(responseKey);
        verify(valueOperations).setIfAbsent(
                eq(lockKey),
                eq("PROCESSING"),
                eq(Duration.ofSeconds(30))
        );
        
    }
     @Test
    void executeIdempotent_WithExistingResponse_ShouldNotExecuteOperation() {

        String idempotencyKey = "test-key";
        String responseKey = "idempotency:response:" + idempotencyKey;
        String cachedResponse = "SUCCESS";

        AtomicInteger executionCount = new AtomicInteger(0);

        
        when(valueOperations.get(responseKey)).thenReturn(cachedResponse);

      
        String result = idempotencyService.executeIdempotent(
                idempotencyKey,
                String.class,
                () -> {
                    executionCount.incrementAndGet();
                    return "NEW_RESPONSE";
                }
        );

       
        assertEquals(cachedResponse, result);
        assertEquals(0, executionCount.get());

        verify(valueOperations).get(responseKey);

       
        verify(valueOperations, never())
                .setIfAbsent(anyString(), any(), any(Duration.class));

        // Verify no cache write
        verify(valueOperations, never())
                .set(anyString(), any(), any(Duration.class));

        
        verify(redisTemplate, never()).delete(anyString());
    }

}
